import { Sky, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { CameraType } from "./CameraType";
import { useEffect, useState } from "react";
import Cctv from "./Cctv";
import { supabase } from "./supabase";

export default function InteriorModel() {
  const interior = useGLTF("/interior.glb");

  const { camera } = useThree();
  const [devices, setDevices] = useState<CameraType[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      const { data, error } = await supabase
        .from("DubaiDevices")
        .select("*")
        .order("id", { ascending: true });
      if (data) {
        console.log(data);
        if (!devices.length) {
          setDevices(
            data.map((dvc) => {
              return {
                id: dvc.id,
                uniqueId: dvc.uniqueId,
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
    console.log("function!");
    console.log("Updated Rotation:", rot);
    console.log("Updated Position:", pos);

    setDevices((prev) => {
      const updated = prev.map((dvc) =>
        dvc.uniqueId === uniqueId
          ? { ...dvc, position: { ...pos }, rotation: { ...rot } }
          : dvc
      );
      console.log("Updated Devices:", updated); // ✅ See the actual result
      return updated;
    });
  };

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c") {
        const newCam: CameraType = {
          uniqueId: crypto.randomUUID(),
          title: "Placed Camera",
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
      if (e.key === "Delete" || e.key === "Backspace") {
        const { data, error } = await supabase
          .from("DubaiDevices")
          .update({
            show: false,
          })
          .eq("id", devices[devices.length - 1].id);
        console.log(data, error || "Deleted successfully");
        setDevices((prev) => prev.slice(0, prev.length - 1));
      }

      if (e.key === "Home" || e.key === "h") {
        console.log("Saving!");
        console.log(devices);
        devices.forEach(async (dvc) => {
          console.log(dvc.id);
          if (dvc.id) {
            console.log("Updating!");
            console.log(dvc);
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
            console.log(data, error || "Updated successfully");
          } else {
            console.log("Inserting!");
            const { data, error } = await supabase
              .from("DubaiDevices")
              .insert({
                uniqueId: dvc.uniqueId,
                ip: dvc.ip,
                mac: dvc.mac,
                notes: dvc.notes,
                port: dvc.port,
                title: dvc.title,
                x: dvc.position.x,
                y: dvc.position.y,
                z: dvc.position.z,
                rot_x: dvc.rotation.x,
                rot_y: dvc.rotation.y,
                rot_z: dvc.rotation.z,
                show: dvc.show,
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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [devices]);
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
      {devices.map((dvc) => {
        if (dvc.show) {
          return (
            <Cctv
              cam={dvc}
              key={dvc.uniqueId}
              onUpdatePosition={onUpdatePosition}
            />
          );
        }
      })}
      <primitive object={interior.scene} scale={10} position={[790, 0, 100]} />
    </>
  );
}
