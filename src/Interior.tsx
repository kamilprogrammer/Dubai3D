import { Html, Sky, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { CameraType } from "./CameraType";
import { useEffect, useRef, useState } from "react";
import Cctv from "./Cctv";
import { supabase } from "./supabase";
import * as THREE from "three";
import { temps } from "./HeatMap";

export default function InteriorModel({
  showStream,
  heatMap,
  setShowStream,
  setStreamValue,
  setShowInterior,
}: {
  showStream: boolean;
  heatMap: boolean;
  setShowStream: React.Dispatch<React.SetStateAction<boolean>>;
  setStreamValue: React.Dispatch<React.SetStateAction<string>>;
  setShowInterior: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const interior = useGLTF("/interior.glb");
  const { camera } = useThree();
  const [isDeveloping, setIsDeveloping] = useState(false);
  const [devices, setDevices] = useState<CameraType[]>([]);
  const InteriorRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    if (heatMap && InteriorRef.current) {
      const targetPosition = new THREE.Vector3(790, 240, 100);
      let t = 0.02;
      const from = camera.position.clone();
      const to = targetPosition.clone();

      //const tmp = new THREE.Object3D();

      const animate = () => {
        t += 0.05;

        // Interpolate position

        // Make tmp look at the target (e.g., your model)
        /*tmp.position.copy(camera.position);
        if (InteriorRef.current) {
          tmp.lookAt(InteriorRef.current.position);
        }
*/
        //console.log(tmp.quaternion);
        // Interpolate orientation
        //camera.quaternion.slerp(tmp.quaternion, 0.1); // smoother interpolation
        camera.position.lerpVectors(from, to, t);

        camera.lookAt(InteriorRef.current!.position);

        camera.rotation.set(
          -1.570796326794897,
          4.163336342344337e-17,
          3.13599999999999518
        );

        if (t < 1) requestAnimationFrame(animate);
      };

      animate();
      //controlsRef.current.enabled = false;
    }
  }, [heatMap]);

  // Fetch Devices..
  useEffect(() => {
    const fetchDevices = async () => {
      const { data, error } = await supabase
        .from("DubaiDevices")
        .select("*")
        .order("id", { ascending: true });
      if (data) {
        //console.log(data);
        if (!devices.length) {
          setDevices(
            data.map((dvc) => {
              return {
                id: dvc.id,
                uniqueId: dvc.uniqueId,
                ip: dvc.ip,
                mac: dvc.mac,
                model: dvc.model,
                vendor: dvc.vendor,
                port: dvc.port,
                username: dvc.username,
                password: dvc.password,
                notes: dvc.notes,
                mode: dvc.mode,

                title: dvc.title,
                position: { x: dvc.x, y: dvc.y, z: dvc.z },
                rotation: { x: dvc.rot_x, y: dvc.rot_y, z: dvc.rot_z },
                show: dvc.show,
              };
            })
          );
        }
      } else {
        console.log(error);
      }
    };
    fetchDevices();
  }, []);
  // Avoiding Noisy errors :-)
  window.addEventListener("error", (event) => {
    if (
      event.message.includes("Failed to execute 'setPointerCapture'") &&
      event.error instanceof DOMException
    ) {
      event.preventDefault();
    }
  });

  const onUpdatePosition = (uniqueId: string, pos: any, rot: any) => {
    {
      /*console.log("function!");
    console.log("Updated Rotation:", rot);
    console.log("Updated Position:", pos);*/
    }

    setDevices((prev) => {
      const updated = prev.map((dvc) =>
        dvc.uniqueId === uniqueId
          ? { ...dvc, position: { ...pos }, rotation: { ...rot } }
          : dvc
      );
      console.log("Updated Devices:", updated);
      return updated;
    });
  };

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c") {
        if (isDeveloping) {
          const newCam: CameraType = {
            uniqueId: crypto.randomUUID(),
            title: "Placed Camera",
            ip: "",
            mac: "",
            model: "IPC-HDBW2230E-S-S2",
            vendor: "Dahua",
            port: 554,
            username: "admin",
            password: "admin#1@go.dubai",
            notes: "",
            position: {
              x: camera.position.x,
              y: camera.position.y,
              z: camera.position.z,
            },
            rotation: {
              x: camera.rotation.x,
              y: camera.rotation.y,
              z: camera.rotation.z,
            },
            show: true,
          };
          setDevices((prev) => [...prev, newCam]);
        }
      }
      if (e.key === "Delete") {
        if (devices[devices.length - 1].id) {
          const { data, error } = await supabase
            .from("DubaiDevices")
            .update({
              show: false,
            })
            .eq("id", devices[devices.length - 1].id);
          console.log(data, error || "Deleted successfully");
        }
        setDevices((prev) => prev.slice(0, prev.length - 1));
      }
      if (e.key === "Home" || e.key === "h") {
        console.log(devices[devices.length - 1]);
        devices.forEach(async (dvc) => {
          if (dvc.id) {
            const { data, error } = await supabase
              .from("DubaiDevices")
              .update({
                x: dvc.position.x,
                y: dvc.position.y,
                z: dvc.position.z,
                rot_x: dvc.rotation.x,
                rot_y: dvc.rotation.y,
                rot_z: dvc.rotation.z,
              })
              .eq("id", dvc.id);
            console.log(data);
            console.log(error || "Updated successfully");
          } else {
            const { data, error } = await supabase
              .from("DubaiDevices")
              .insert({
                uniqueId: dvc.uniqueId,
                ip: dvc.ip,
                mac: dvc.mac,
                notes: dvc.notes,
                port: 554,
                title: dvc.title,
                username: "admin",
                password: "admin#1@go.dubai",
                vendor: "Dahua",
                model: "IPC-HDBW2230E-S-S2",
                x: dvc.position.x,
                y: dvc.position.y,
                z: dvc.position.z,
                rot_x: dvc.rotation.x,
                rot_y: dvc.rotation.y,
                rot_z: dvc.rotation.z,
                mode: "ACTIVE",
                show: true,
              })
              .select("*");
            console.log(data);
            setDevices((prev) => {
              const updated = prev.map((dvc) =>
                dvc.uniqueId === dvc.uniqueId
                  ? { ...dvc, id: data![0].id }
                  : dvc
              );
              console.log("Updated Devices:", updated); // ✅ See the actual result
              return updated;
            });
            console.log(data, error || "Inserted successfully");
          }
        });
      }
      if (e.key === "o") {
        function triggerEnterBuilding() {
          const targetPosition = new THREE.Vector3(0, 10, 10);
          let t = 0;
          const from = camera.position.clone();
          const to = targetPosition.clone();

          const animate = () => {
            t += 0.01;
            camera.position.lerpVectors(from, to, t);
            const targetEuler = new THREE.Euler(0, 0, 0); // yaw: 90 degrees
            const targetQuaternion = new THREE.Quaternion().setFromEuler(
              targetEuler
            );

            camera.quaternion.slerp(targetQuaternion, 0.1); // 0.1 is interpolation speed
            if (t < 1) requestAnimationFrame(animate);
            else {
              setShowInterior(false); // Midway: switch content
            }
          };

          animate();
        }
        triggerEnterBuilding();
      }
      if (e.key === "p") {
        setIsDeveloping(!isDeveloping);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [devices, isDeveloping]);
  return (
    <>
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} intensity={10} />
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

      {heatMap &&
        temps.map((temp) => {
          console.log(temp);
          return (
            <Html
              position={[temp.x, 10, temp.z]}
              //rotation={[0, Math.PI / 2, Math.PI]}
              key={temp.id}
              children={
                <span className="font-cairo text-lg whitespace-nowrap">
                  {temp.value}
                </span>
              }
            />
          );
        })}
      {devices
        .filter((dvc) => dvc.show)
        .map((dvc) => (
          <Cctv
            cam={dvc}
            isDeveloping={isDeveloping}
            showStream={showStream}
            setShowStream={setShowStream}
            setStreamValue={setStreamValue}
            key={dvc.uniqueId}
            onUpdatePosition={onUpdatePosition}
          />
        ))}
      <primitive
        object={interior.scene}
        scale={10}
        position={[790, 0, 100]}
        ref={InteriorRef}
      />
    </>
  );
}
