import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function DroneFollower({ gltf, ref }: { gltf: any; ref: React.RefObject<THREE.Object3D | null> }) {
  const { camera } = useThree();

  useFrame(() => {
    if (ref.current) {
      // Get the camera's world position
      const cameraPos = new THREE.Vector3();
      camera.getWorldPosition(cameraPos);

      // Calculate the drone's position by moving backwards from the camera
      const dronePos = new THREE.Vector3();
      dronePos.copy(cameraPos);

      // Create a direction vector pointing backwards from the camera
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(camera.quaternion);

      // Move the drone position backwards by 0.5 units (z-axis offset)
      dronePos.addScaledVector(direction, 0.5);

      // Adjust the height offset
      dronePos.y -= 0.25;

      // Set the drone's position
      ref.current.position.copy(dronePos);

      // Create a quaternion from the camera's rotation
      const cameraQuat = new THREE.Quaternion();
      camera.rotation.toArray();
      cameraQuat.setFromEuler(camera.rotation);

      // Create a quaternion for 180 degree Y rotation
      const y180 = new THREE.Quaternion();
      y180.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

      // Multiply the quaternions to get the final rotation
      const finalQuat = new THREE.Quaternion();
      finalQuat.multiplyQuaternions(cameraQuat, y180);

      // Set the drone's rotation from the final quaternion
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
