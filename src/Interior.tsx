import { Sky, useGLTF } from "@react-three/drei";

export default function InteriorModel() {
  const interior = useGLTF("/interior.glb");
  return (
    <>
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} />
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
      <primitive object={interior.scene} scale={10} position={[790, 0, 100]} />
    </>
  );
}
