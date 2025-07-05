import { useFrame } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function DroneFollower({
  gltf,
  ref,
}: {
  gltf: any;
  ref: React.RefObject<THREE.Object3D | null>;
}) {
  const { camera } = useThree();

  useFrame(() => {
    if (ref.current) {
      const cameraPos = new THREE.Vector3();
      camera.getWorldPosition(cameraPos);

      const dronePos = new THREE.Vector3();
      dronePos.copy(cameraPos);

      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(camera.quaternion);

      dronePos.addScaledVector(direction, 0.5);

      dronePos.y -= 0.25;

      ref.current.position.copy(dronePos);

      const cameraQuat = new THREE.Quaternion();
      camera.rotation.toArray();
      cameraQuat.setFromEuler(camera.rotation);

      const y180 = new THREE.Quaternion();
      y180.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

      const finalQuat = new THREE.Quaternion();
      finalQuat.multiplyQuaternions(cameraQuat, y180);

      ref.current.quaternion.copy(finalQuat);
    }
  });

  // Animations
  useFrame((state) => {
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(gltf.scene);
      const animationAction = mixer.clipAction(gltf.animations[0]);
      animationAction.play();
      mixer.update(state.clock.getElapsedTime());
    }
  });

  return <primitive ref={ref} object={gltf.scene} />;
}
