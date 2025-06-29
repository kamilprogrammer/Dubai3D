import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function Player() {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = new THREE.Vector3();
  const keys = useRef<{ [key: string]: boolean }>({});

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
    if (keys.current[" "]) direction.y += 1;
    if (keys.current["shift"]) direction.y -= 1;

    direction.normalize();

    velocity.current
      .copy(direction)
      .applyEuler(camera.rotation)
      .multiplyScalar(1);
    camera.position.add(velocity.current);
  });

  return <PointerLockControls />;
}
