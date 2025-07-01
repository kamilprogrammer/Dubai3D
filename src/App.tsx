import "./App.css";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useState } from "react";
import Scene from "./Scene";

function App() {
  const dubai = useGLTF("/dubai.glb");
  const drone = useGLTF("/drone.glb");
  const [showInterior, setShowInterior] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <>
      {isTransitioning && (
        <>
          <div className="fixed top-0 left-0 h-full w-1/2 z-50 bg-blue-200 animate-slideInLeft" />
          <div className="fixed top-0 right-0 h-full w-1/2 z-50 bg-blue-200 animate-slideInRight" />
        </>
      )}
      <div className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl z-50">
        +
      </div>

      <div className="h-screen w-screen top-0 left-0 fixed">
        <Canvas camera={{ position: [0, 75, 75] }}>
          <Scene
            dubai={dubai}
            drone={drone}
            setShowInterior={setShowInterior}
            showInterior={showInterior}
            isTransitioning={isTransitioning}
            setIsTransitioning={setIsTransitioning}
          />
        </Canvas>
      </div>
    </>
  );
}
export default App;
