import { PivotControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { CameraType } from "./CameraType";

type Props = {
  cam: CameraType;
  onUpdatePosition: (
    uniqueId: string,
    pos: { x: number; y: number; z: number },
    rot: { x: number; y: number; z: number } // Euler
  ) => void;
};

export default function Cctv({ cam, onUpdatePosition }: Props) {
  const objRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/cctv.glb");
  const previousPosition = useRef<THREE.Vector3>(new THREE.Vector3());
  const StaticPosition = useMemo(
    () => new THREE.Vector3(cam.position.x, cam.position.y, cam.position.z),
    []
  );

  const previousRotation = useRef<THREE.Euler>(new THREE.Euler());
  const StaticRotation = useMemo(
    () => new THREE.Euler(cam.rotation.x, cam.rotation.y, cam.rotation.z),
    []
  );

  return (
    <PivotControls
      anchor={[0, 0, 0]}
      scale={3}
      disableScaling
      onDragEnd={() => {
        if (!objRef.current) return;

        // read world transform
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        objRef.current.updateMatrixWorld();
        objRef.current.matrixWorld.decompose(pos, quat, new THREE.Vector3());

        const euler = new THREE.Euler().setFromQuaternion(quat, "XYZ");

        // send FRESH plain objects to parent
        if (
          pos.x !== previousPosition.current.x ||
          pos.y !== previousPosition.current.y ||
          pos.z !== previousPosition.current.z ||
          euler.x !== previousRotation.current.x ||
          euler.y !== previousRotation.current.y ||
          euler.z !== previousRotation.current.z
        ) {
          onUpdatePosition(
            cam.uniqueId,
            { x: pos.x, y: pos.y, z: pos.z },
            { x: euler.x, y: euler.y, z: euler.z }
          );
          previousPosition.current.copy(pos);
          previousRotation.current.copy(euler);
        }
      }}
    >
      {/* this is the object PivotControls actually moves, so put the ref HERE */}
      <group
        ref={objRef}
        position={[StaticPosition.x, StaticPosition.y, StaticPosition.z]}
        rotation={[StaticRotation.x, StaticRotation.y, StaticRotation.z]}
      >
        <primitive object={scene.clone()} scale={[0.7, 0.7, 0.7]} />
      </group>
    </PivotControls>
  );
}
