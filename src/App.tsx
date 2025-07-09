import "./App.css";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Suspense, useState } from "react";
import Scene from "./Scene";
import { motion } from "framer-motion";
import { Button } from "./components/ui/button";
import { Leva } from "leva";
import { HeatLayer } from "./HeatMap";

function App() {
  const dubai = useGLTF("/dubai.glb");
  const drone = useGLTF("/drone.glb");
  const [showInterior, setShowInterior] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showStream, setShowStream] = useState(false);
  const [streamValue, setStreamValue] = useState("in");
  const [heatMap, setHeatMap] = useState(false);

  return (
    <>
      {/* Leva Debug Panel */}
      <Leva
        theme={{
          fontSizes: {
            root: "16px", // default is 13px
            toolTip: "12px",
          },
          sizes: {
            rootWidth: "420px",
          },
        }}
      />
      {showStream && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-1/2 ${
            streamValue === "out" || streamValue === "door"
              ? "left-1/2 -translate-x-1/2"
              : "left-[1400px]"
          } z-50 w-[60vw] max-w-[60vw]  -translate-y-1/2 rounded-xl bg-black p-4 shadow-xl`}
        >
          <video
            src={
              streamValue === "out"
                ? "/stream/out.mp4"
                : streamValue === "door"
                ? "/stream/door.mp4"
                : "/stream/in.mp4"
            }
            controls
            autoPlay
            muted
            loop
            className="w-full h-auto rounded-xl"
          />
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => setShowStream(false)}
              variant={"destructive"}
            >
              Close
            </Button>
          </div>
        </motion.div>
      )}
      {isTransitioning && (
        <>
          <div className="fixed top-0 left-0 h-full w-1/2 z-50 bg-blue-200 animate-slideInLeft" />
          <div className="fixed top-0 right-0 h-full w-1/2 z-50 bg-blue-200 animate-slideInRight" />
        </>
      )}
      <div className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl z-50">
        +
      </div>

      <div className="fixed h-screen w-screen top-0 left-0">
        <Canvas camera={{ position: [0, 75, 75] }}>
          <Scene
            dubai={dubai}
            drone={drone}
            heatMap={heatMap}
            setHeatMap={setHeatMap}
            showInterior={showInterior}
            setShowInterior={setShowInterior}
            isTransitioning={isTransitioning}
            setIsTransitioning={setIsTransitioning}
            showStream={showStream}
            setShowStream={setShowStream}
            setStreamValue={setStreamValue}
          />
        </Canvas>
        <div className="absolute top-0 left-0 w-screen h-screen pointer-events-none z-10">
          {heatMap && <HeatLayer />}
        </div>
      </div>
    </>
  );
}
export default App;
