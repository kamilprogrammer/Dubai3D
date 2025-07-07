import { Html, PivotControls } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { CameraType } from "./CameraType";
import { motion } from "framer-motion";
import InfoImage from "./InfoBadge";

type Props = {
  cam: CameraType;
  isDeveloping: boolean;
  onUpdatePosition: (
    uniqueId: string,
    pos: { x: number; y: number; z: number },
    rot: { x: number; y: number; z: number } // Euler
  ) => void;
};

export default function Cctv({ cam, isDeveloping, onUpdatePosition }: Props) {
  const objRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/cctv.glb");
  const [hovered, setHovered] = useState(false);

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
      enabled={isDeveloping}
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
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        position={[StaticPosition.x, StaticPosition.y, StaticPosition.z]}
        rotation={[StaticRotation.x, StaticRotation.y, StaticRotation.z]}
      >
        <InfoImage position={[1.1, 0.5, 0]} scale={[0.75, 0.75]} />
        <primitive object={scene.clone()} scale={[0.7, 0.7, 0.7]} />
        {hovered && (
          <Html distanceFactor={60} position={[2, 0, 0]} center>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center backdrop-blur-sm shadow-xl rounded-xl p-4 text-xs text-gray-800 w-64 border border-gray-200"
            >
              <div className="bg-white/50 backdrop-blur-sm shadow-xl rounded-xl p-4 text-xs text-gray-800 w-64 border border-gray-200">
                <h3 className="font-cairo text-sm font-bold font-weight-bold mb-2 text-black">
                  {cam.title || "Camera #1"}
                </h3>
                <ul className="space-y-1">
                  {cam.ip && (
                    <li className="space-y-2 backdrop-blur-sm shadow-xl rounded-md p-2 text-xs text-gray-800 border border-gray-200">
                      <span className="font-cairo font-semibold">{cam.ip}</span>
                    </li>
                  )}
                  {cam.mac && (
                    <li className="space-y-2 backdrop-blur-sm shadow-xl rounded-md p-2 text-xs text-gray-800 border border-gray-200">
                      <span className="font-cairo font-semibold">
                        {cam.mac}
                      </span>
                    </li>
                  )}
                  {cam.vendor && (
                    <li className="space-y-2 backdrop-blur-sm shadow-xl rounded-md p-2 text-xs text-gray-800 border border-gray-200">
                      <span className="font-cairo font-semibold">
                        {cam.vendor}
                      </span>
                    </li>
                  )}
                  {cam.model && (
                    <li className="space-y-2 backdrop-blur-sm shadow-xl rounded-md p-2 text-xs text-gray-800 border border-gray-200">
                      <span className="font-cairo font-semibold">
                        {cam.model}
                      </span>
                    </li>
                  )}
                  {cam.port && (
                    <li className="space-y-2 backdrop-blur-sm shadow-xl rounded-md p-2 text-xs text-gray-800 border border-gray-200">
                      <span className="font-cairo font-semibold">
                        Stream Port: {cam.port}
                      </span>
                    </li>
                  )}
                  {cam.notes && (
                    <li className="space-y-2 backdrop-blur-sm shadow-xl rounded-md p-2 text-xs text-gray-800 border border-gray-200">
                      <span className="font-cairo font-semibold">
                        {cam.notes}
                      </span>
                    </li>
                  )}
                  {cam.mode && (
                    <li className="flex items-center justify-center space-y-2 backdrop-blur-sm shadow-xl rounded-md p-2 text-xs text-gray-800 border border-gray-200">
                      <span className="font-cairo font-semibold">
                        {cam.mode === "ACTIVE" ? (
                          <div
                            className="h-2 w-2 rounded-full justify-center items-center mt-2 mr-1"
                            style={{
                              backgroundColor: "green",
                            }}
                          ></div>
                        ) : (
                          <div
                            className="h-2 w-2 rounded-full justify-center items-center mt-2 mr-1"
                            style={{
                              backgroundColor: "red",
                            }}
                          ></div>
                        )}
                      </span>

                      <span className="font-cairo font-semibold">
                        {cam.mode === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </motion.div>
          </Html>
        )}
      </group>
    </PivotControls>
  );
}
