import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function Camera({ interior }: { interior: boolean }) {
  const { camera } = useThree();

  const direction = new THREE.Vector3();
  const keys = useRef<{ [key: string]: boolean }>({});
  let speed: number = interior ? 1 : 1.5;

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

  useFrame(() => {
    direction.set(0, 0, 0);

    if (keys.current["w"]) {
      direction.z -= 1;
    }
    if (keys.current["s"]) {
      direction.z += 1;
    }
    if (keys.current["a"]) {
      direction.x -= 1;
    }
    if (keys.current["d"]) {
      direction.x += 1;
    }
    if (keys.current[" "]) {
      direction.y += 1;
    }
    if (keys.current["shift"]) {
      if (camera.position.y > 10) {
        direction.y -= 1;
      }
    }

    // Border
    if (interior) {
      if (camera.position.y < 10) {
        camera.position.y = 10;
      }
      if (camera.position.y > 150) {
        camera.position.y = 150;
      }
    } else {
      if (camera.position.y < 30) {
        camera.position.y = 30;
      }
      if (camera.position.y > 150) {
        camera.position.y = 150;
      }
    }

    direction.normalize();
    const moveDir = new THREE.Vector3(direction.x, direction.y, direction.z)
      .applyQuaternion(camera.quaternion)
      .normalize()
      .multiplyScalar(speed);

    // Add vertical (y) manually
    if (interior) {
      moveDir.y = direction.y * speed;
    }

    camera.position.add(moveDir);
  });

  return <PointerLockControls /*makeDefault*/ />;
}
