import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { AudioListener, Audio, AudioLoader } from "three";
import * as THREE from "three";

export default function Camera({ interior }: { interior: boolean }) {
  const { camera } = useThree();

  // My own audio/sound Implementation that is the best in the east or the west idk 😅😓😄
  const listener = new AudioListener();
  camera.add(listener);
  const sound = useRef<Audio>(null);
  const buffer = useLoader(AudioLoader, "/walk.mp3");
  useEffect(() => {
    sound.current = new Audio(listener);
    sound.current.setBuffer(buffer);
    sound.current.setLoop(true);
    sound.current.setVolume(0.3);
    sound.current.playbackRate = 1.6;
  }, [buffer]);

  const velocity = useRef(new THREE.Vector3());
  const direction = new THREE.Vector3();
  const keys = useRef<{ [key: string]: boolean }>({});
  let speed: number = interior ? 0.6 : 1.2;

  useEffect(() => {
    const down = (e: KeyboardEvent) =>
      (keys.current[e.key.toLowerCase()] = true);
    const up = (e: KeyboardEvent) =>
      (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  let clock = new THREE.Clock();

  useFrame(() => {
    direction.set(0, 0, 0);

    if (keys.current["w"]) {
      if (interior) {
        const time = clock.getElapsedTime();
        const bobbing = Math.sin(time * 10) * 0.5; // up-down movement
        camera.position.y = 10 + bobbing;
      }
      direction.z -= 1;
    }
    if (keys.current["s"]) {
      if (interior) {
        const time = clock.getElapsedTime();
        const bobbing = Math.sin(time * 10) * 0.5; // up-down movement
        camera.position.y = 10 + bobbing;
      }
      direction.z += 1;
    }
    if (keys.current["a"]) {
      direction.x -= 1;
    }
    if (keys.current["d"]) {
      direction.x += 1;
    }
    if (keys.current[" "]) {
      if (!interior) direction.y += 1;
    }
    if (keys.current["shift"]) {
      if (!interior) direction.y -= 1;
    }

    // Playing / Pausing Sound
    if (interior) {
      const isMoving = direction.length() > 0;

      if (sound.current) {
        if (isMoving && !sound.current.isPlaying) {
          sound.current.play();
        } else if (!isMoving && sound.current.isPlaying) {
          sound.current.pause();
        }
      }
    }

    direction.normalize();

    //const originalY = camera.position.y;

    velocity.current
      .copy(direction)
      .applyEuler(camera.rotation)
      .multiplyScalar(speed);
    camera.position.add(velocity.current);

    /*if (interior) {
      camera.position.y = originalY;
    }*/
  });

  if (interior) {
    camera.position.z = 10;
  }

  return <PointerLockControls />;
}
