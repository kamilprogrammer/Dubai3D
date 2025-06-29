import "./App.css";
import { Canvas } from "@react-three/fiber";
import Player from "./Camera";
import DroneFollower from "./Drone";
import { useGLTF } from "@react-three/drei";
import { Text } from "@react-three/drei";

function App() {
  const dubai = useGLTF("/dubai.glb");
  const drone = useGLTF("/drone.glb");
  console.log(dubai);
  return (
    <div className="h-screen w-screen top-0 left-0 fixed">
      <Canvas camera={{ position: [0, 75, 75] }}>
        <primitive object={dubai.scene} />
        <Text
          position={[0, 150, -550]}
          fontSize={90}
          color="white"
          rotation={[0, 0, 0]}
          font="/cairo.ttf"
          lineHeight={1.2}
        >
          {"Dubai 3D \nVisualization"}
        </Text>
        <Text
          position={[-196, 46, -550]}
          fontSize={20}
          color="gray"
          rotation={[0, 0, 0]}
          font="/cairo.ttf"
          lineHeight={1.2}
        >
          {"Test #1"}
        </Text>
        <Text
          position={[100, 46, -550]}
          fontSize={20}
          color="gray"
          rotation={[0, 0, 0]}
          font="/cairo.ttf"
          lineHeight={1.2}
        >
          {"By Kamel Rifai && Ammar Rifai :)"}
        </Text>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 10]} intensity={2} />
        <directionalLight position={[-10, -10, -10]} intensity={2} />

        <Player />
        <DroneFollower gltf={drone} />
      </Canvas>
    </div>
  );
}

export default App;
