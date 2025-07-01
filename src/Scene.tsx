import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Button } from "./components/ui/button";
import { Html, Text } from "@react-three/drei";
import { Sky } from "@react-three/drei";
import { Float } from "@react-three/drei";
import Camera from "./Camera";
import DroneFollower from "./Drone";
import InteriorModel from "./Interior";

export default function Scene({
  dubai,
  drone,
  setShowInterior,
  showInterior,
  isTransitioning,
  setIsTransitioning,
}: {
  dubai: any;
  drone: any;
  setShowInterior: (b: boolean) => void;
  showInterior: boolean;
  isTransitioning: boolean;
  setIsTransitioning: (b: boolean) => void;
}) {
  const DubaiRef = useRef<THREE.Object3D | null>(null);
  const DroneRef = useRef<THREE.Object3D | null>(null);
  const buttonRef = useRef<THREE.Mesh | null>(null);
  const lookingRef = useRef(false);
  const [isLookingAtButton, setIsLookingAtButton] = useState(false);
  const { camera } = useThree();

  function triggerEnterBuilding() {
    const targetPosition = new THREE.Vector3(1010, 10, 20);
    let t = 0;
    const from = camera.position.clone();
    const to = targetPosition.clone();

    const animate = () => {
      t += 0.01;
      camera.position.lerpVectors(from, to, t);
      const targetEuler = new THREE.Euler(0, Math.PI / 2, 0); // yaw: 90 degrees
      const targetQuaternion = new THREE.Quaternion().setFromEuler(targetEuler);

      camera.quaternion.slerp(targetQuaternion, 0.1); // 0.1 is interpolation speed
      if (t < 1) requestAnimationFrame(animate);
      else {
        setIsTransitioning(true);
        setTimeout(() => setShowInterior(true), 1000); // Midway: switch content
        setTimeout(() => setIsTransitioning(false), 2000); // Finish transition
      }
    };

    animate();
  }

  useFrame(() => {
    if (!buttonRef.current) return;

    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    raycaster.set(camera.position, direction);

    const intersects = raycaster.intersectObjects([buttonRef.current], true);
    const isLooking = intersects.length > 0;

    setIsLookingAtButton(isLooking);
    lookingRef.current = isLooking;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "e" && lookingRef.current && !showInterior) {
        triggerEnterBuilding();
        setShowInterior(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* ---------- OUTSIDE (city + drone) ---------- */}
      {!showInterior && (
        <>
          {/* Dubai city */}
          <primitive object={dubai.scene} ref={DubaiRef} />

          {/* Building entry button */}
          <mesh position={[510, 100, 56]} ref={buttonRef}>
            <boxGeometry args={[1, 8, 24]} />
            <meshStandardMaterial visible={false} />
            <Html distanceFactor={100}>
              <Button
                variant="default"
                size="lg"
                className="justify-center items-center -ml-28 -mt-16"
              >
                🏢 Kamel Rifai's Building
              </Button>
            </Html>
          </mesh>

          {/* “Press E” prompt (only when aiming and not during transition) */}
          {isLookingAtButton && !isTransitioning && (
            <Html position={[510, 110, 56]} distanceFactor={100}>
              <Button variant="default" size="lg">
                Press <b>E</b> to enter
              </Button>
            </Html>
          )}

          {/* Labels */}
          <Text
            position={[0, 150, -550]}
            fontSize={90}
            color="black"
            font="/cairo.ttf"
            lineHeight={1.2}
          >
            {"Dubai 3D\nVisualization"}
          </Text>
          <Text
            position={[-196, 46, -550]}
            fontSize={20}
            color="gray"
            font="/cairo.ttf"
            lineHeight={1.2}
          >
            {"Test #1"}
          </Text>
          <Text
            position={[100, 46, -550]}
            fontSize={20}
            color="gray"
            font="/cairo.ttf"
            lineHeight={1.2}
          >
            {"By Kamel Rifai && Ammar Rifai :)"}
          </Text>

          {/* Sky only for exterior */}
          <Sky
            distance={450000}
            sunPosition={[100, 40, 100]}
            turbidity={2}
            rayleigh={0.4}
            mieCoefficient={0.001}
            mieDirectionalG={0.7}
            inclination={0.47}
            azimuth={0.25}
          />
        </>
      )}
      {/* Drone */}
      <Camera interior={showInterior} />

      {!showInterior && (
        <Float
          speed={1}
          floatIntensity={0.1}
          rotationIntensity={0}
          floatingRange={[0, 0.6]}
        >
          <DroneFollower gltf={drone} ref={DroneRef} />
        </Float>
      )}

      {/* Lights & controls shared by both scenes */}
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 10]} intensity={2} />
      <directionalLight position={[-10, -10, -10]} intensity={2} />
      {/* Interior Model */}
      {showInterior && (
        <Suspense fallback={null}>
          <InteriorModel />
        </Suspense>
      )}
    </>
  );
}
