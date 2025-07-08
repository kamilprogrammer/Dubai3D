import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

export default function Badge({
  active = true,
  position = [0, 0, 0],
  scale = [1, 1],
}) {
  const texture = useLoader(
    THREE.TextureLoader,
    active ? "/info.png" : "/cross.png"
  );
  const position0 = new THREE.Vector3(position[0], position[1], position[2]);
  const scale0 = new THREE.Vector2(scale[0], scale[1]);
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  return (
    <mesh position={position0} ref={meshRef}>
      <planeGeometry args={[scale0.x, scale0.y]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.5}
        side={THREE.DoubleSide}
        depthTest={true}
        depthWrite={true}
      />
    </mesh>
  );
}
