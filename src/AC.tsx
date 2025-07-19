import { Html } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import type { AcType } from "./AcType";

type Props = {
  ac: AcType;
  isDeveloping: boolean;
};

export default function AC({ ac, isDeveloping }: Props) {
  const objRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(ac.mode === "ACTIVE" ? true : false);
  const [Loading, setLoading] = useState(false);

  const Inactivate = async () => {
    setLoading(true);
    console.log(ac.id);

    setActive(false);
    setLoading(false);
  };

  const Activate = async () => {
    setLoading(true);
    console.log(ac.id);

    setActive(true);
    setLoading(false);
  };

  const StaticPosition = useMemo(
    () => new THREE.Vector3(ac.position.x, ac.position.y, ac.position.z),
    []
  );

  const StaticRotation = useMemo(
    () => new THREE.Euler(ac.rotation.x, ac.rotation.y, ac.rotation.z),
    []
  );

  return (
    <group
      ref={objRef}
      onPointerOver={() => {
        setHovered(true);
      }}
      onPointerOut={() => {
        setHovered(false);
      }}
      position={[StaticPosition.x, StaticPosition.y, StaticPosition.z]}
      rotation={[StaticRotation.x, StaticRotation.y, StaticRotation.z]}
    >
      <mesh>
        <boxGeometry args={[6, 3, 6]} />
        <meshStandardMaterial color="red" visible={false} />
      </mesh>
      {/*<primitive object={scene.clone()} scale={[0.7, 0.7, 0.7]} />*/}
      {hovered && !isDeveloping && (
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
                {ac.title || "Camera #1"}
              </h3>
              <ul className="space-y-1">
                {ac.ip && (
                  <li className="space-y-2 backdrop-blur-sm shadow-xl rounded-md p-2 text-xs text-gray-800 border border-gray-200">
                    <span className="font-cairo font-semibold">{ac.ip}</span>
                  </li>
                )}
                {ac.mac && (
                  <li className="space-y-2 backdrop-blur-sm shadow-xl rounded-md p-2 text-xs text-gray-800 border border-gray-200">
                    <span className="font-cairo font-semibold">{ac.mac}</span>
                  </li>
                )}
                {ac.vendor && (
                  <li className="space-y-2 backdrop-blur-sm shadow-xl rounded-md p-2 text-xs text-gray-800 border border-gray-200">
                    <span className="font-cairo font-semibold">
                      {ac.vendor}
                    </span>
                  </li>
                )}
                {ac.model && (
                  <li className="space-y-2 backdrop-blur-sm shadow-xl rounded-md p-2 text-xs text-gray-800 border border-gray-200">
                    <span className="font-cairo font-semibold">{ac.model}</span>
                  </li>
                )}

                {ac.notes && (
                  <li className="space-y-2 backdrop-blur-sm shadow-xl rounded-md p-2 text-xs text-gray-800 border border-gray-200">
                    <span className="font-cairo font-semibold">{ac.notes}</span>
                  </li>
                )}
                {
                  <li className="flex items-center justify-center space-y-2 backdrop-blur-sm shadow-xl rounded-md p-2 text-xs text-gray-800 border border-gray-200">
                    <span className="font-cairo font-semibold">
                      {active ? (
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
                      {active ? "Active" : "Inactive"}
                    </span>
                  </li>
                }

                <li className="space-y-2 backdrop-blur-sm shadow-xl rounded-md p-2 border border-gray-200 bg-neutral-700">
                  <div className="flex items-center justify-evenly">
                    <Switch
                      className="w-9 pl-1 py-2 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-700"
                      checked={active}
                      disabled={Loading}
                      onCheckedChange={async (checked) => {
                        if (checked) {
                          await Activate();
                        } else {
                          await Inactivate();
                        }
                      }}
                    />
                    <span className="font-cairo font-semibold text-white">
                      On/Off
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        </Html>
      )}
    </group>
  );
}
