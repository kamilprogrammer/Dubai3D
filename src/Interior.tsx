import { Html, Sky, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { CameraType } from "./CameraType";
import { useEffect, useRef, useState } from "react";
import Cctv from "./Cctv";
import { supabase } from "./supabase";
import * as THREE from "three";
import { temps } from "./HeatMap";
import AC from "./AC";
import type { AcType } from "./AcType";
import { useControls, folder } from "leva";

export default function InteriorModel({
  showStream,
  heatMap,
  setHeatMap,
  setShowStream,
  setStreamValue,
  setShowInterior,
}: {
  showStream: boolean;
  heatMap: boolean;
  setHeatMap: React.Dispatch<React.SetStateAction<boolean>>;
  setShowStream: React.Dispatch<React.SetStateAction<boolean>>;
  setStreamValue: React.Dispatch<React.SetStateAction<string>>;
  setShowInterior: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const interior = useGLTF("/interior.glb");
  const { camera } = useThree();
  const [isDeveloping, setIsDeveloping] = useState(false);
  const [devices, setDevices] = useState<CameraType[]>([]);
  const InteriorRef = useRef<THREE.Object3D | null>(null);
  console.log(interior.scene);

  // Debug Controls
  const { ShowAC } = useControls({
    AC: folder({
      ShowAC: true,
    }),
  });

  // removing the FCUs
  useEffect(() => {
    if (!ShowAC) {
      if (InteriorRef.current) {
        console.log("removing FCUs");
        const fcu = InteriorRef.current.getObjectByName("FCU");
        fcu!.visible = false;
        for (let i = 1; i < 13; i++) {
          if (i < 10) {
            const fcu = InteriorRef.current.getObjectByName("FCU00" + i);
            if (fcu) {
              fcu!.visible = false;
            }
          } else {
            const fcu = InteriorRef.current.getObjectByName("FCU0" + i);
            if (fcu) {
              fcu!.visible = false;
            }
          }
        }
      }
    }
    if (ShowAC) {
      if (InteriorRef.current) {
        console.log("showing FCUs");
        const fcu = InteriorRef.current.getObjectByName("FCU");
        fcu!.visible = true;
        for (let i = 1; i < 13; i++) {
          if (i < 10) {
            const fcu = InteriorRef.current.getObjectByName("FCU00" + i);
            if (fcu) {
              fcu!.visible = true;
            }
          } else {
            const fcu = InteriorRef.current.getObjectByName("FCU0" + i);
            if (fcu) {
              fcu!.visible = true;
            }
          }
        }
      }
    }
  }, [interior, InteriorRef, ShowAC]);
  useEffect(() => {
    if (heatMap && InteriorRef.current) {
      const targetPosition = new THREE.Vector3(790, 240, 100);
      let t = 0.02;
      const from = camera.position.clone();
      const to = targetPosition.clone();

      //const tmp = new THREE.Object3D();

      const animate = () => {
        t += 0.06;

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
      if (e.key === "Delete" && !heatMap) {
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
      if ((e.key === "Home" || e.key === "h") && !heatMap) {
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
      if (e.key === "o" && !heatMap) {
        console.log(heatMap);
        //setHeatMap(false);
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

            camera.quaternion.slerp(targetQuaternion, 0.1);
            if (t < 1) requestAnimationFrame(animate);
            else {
              setShowInterior(false); // Midway: switch content
            }
          };

          animate();
        }
        triggerEnterBuilding();
      }
      if (e.key === "p" && !heatMap) {
        setIsDeveloping(!isDeveloping);
      }
      if (e.key === "0" && !heatMap) {
        console.log(camera.position);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [devices, isDeveloping, heatMap]);
  const [mockACs, setMockACs] = useState<AcType[]>([
    {
      id: 1,
      uniqueId: "mockAC #1",
      title: "Machine Sense #1",
      ip: "192.168.159.200",
      mac: "00:1A:2B:3C:4D:5E",
      model: "IOT AC #1",
      vendor: "Machine Sense",
      notes: "Mock AC",
      position: {
        x: 980.2782602371987,
        y: 24.482972428416,
        z: 159.55603480332238,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      mode: "ACTIVE",
      show: true,
    },
    {
      id: 2,
      uniqueId: "mockAC #2",
      title: "Machine Sense #2",
      ip: "192.168.159.201",
      mac: "00:1A:2B:3C:4D:5E",
      model: "IOT AC #2",
      vendor: "Machine Sense",
      notes: "Mock AC",
      position: {
        x: 889.5978900679819,
        y: 24.455844122715675,
        z: 234.15089663198444,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      mode: "ACTIVE",
      show: true,
    },
    {
      id: 3,
      uniqueId: "mockAC #3",
      title: "Machine Sense #3",
      ip: "192.168.159.202",
      mac: "00:1A:2B:3C:4D:5E",
      model: "IOT AC #3",
      vendor: "Machine Sense",
      notes: "Mock AC",
      position: {
        x: 784.2617927370359,
        y: 24.455844122715675,
        z: 236.97698633631833,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      mode: "ACTIVE",
      show: true,
    },
    {
      id: 4,
      uniqueId: "mockAC #4",
      title: "Machine Sense #4",
      ip: "192.168.159.203",
      mac: "00:1A:2B:3C:4D:5E",
      model: "IOT AC #4",
      vendor: "Machine Sense",
      notes: "Mock AC",
      position: {
        x: 752.1966208347592,
        y: 24.455844122715675,
        z: 236.75972767346076,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      mode: "ACTIVE",
      show: true,
    },
    {
      id: 5,
      uniqueId: "mockAC #5",
      title: "Machine Sense #5",
      ip: "192.168.159.204",
      mac: "00:1A:2B:3C:4D:5E",
      model: "IOT AC #5",
      vendor: "Machine Sense",
      notes: "Mock AC",
      position: {
        x: 685.5230408328782,
        y: 24.455844122715675,
        z: 219.59089723073265,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      mode: "ACTIVE",
      show: true,
    },
    {
      id: 6,
      uniqueId: "mockAC #6",
      title: "Machine Sense #6",
      ip: "192.168.159.205",
      mac: "00:1A:2B:3C:4D:5E",
      model: "IOT AC #6",
      vendor: "Machine Sense",
      notes: "Mock AC",
      position: {
        x: 619.6305099584712,
        y: 24.455844122715675,
        z: 191.99442585683687,
      },
      rotation: {
        x: 0,
        y: Math.PI / 5,
        z: 0,
      },
      mode: "ACTIVE",
      show: true,
    },
    {
      id: 7,
      uniqueId: "mockAC #7",
      title: "Machine Sense #7",
      ip: "192.168.159.206",
      mac: "00:1A:2B:3C:4D:5E",
      model: "IOT AC #7",
      vendor: "Machine Sense",
      notes: "Mock AC",
      position: {
        x: 640.287466136744,
        y: 24.455844122715675,
        z: 127.80189738168656,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      mode: "ACTIVE",
      show: true,
    },
    {
      id: 8,
      uniqueId: "mockAC #8",
      title: "Machine Sense #8",
      ip: "192.168.159.207",
      mac: "00:1A:2B:3C:4D:5E",
      model: "IOT AC #8",
      vendor: "Machine Sense",
      notes: "Mock AC",
      position: {
        x: 634.8857688088333,
        y: 24.455844122715675,
        z: 28.0699621969406,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      mode: "ACTIVE",
      show: true,
    },
    {
      id: 9,
      uniqueId: "mockAC #9",
      title: "Machine Sense #9",
      ip: "192.168.159.208",
      mac: "00:1A:2B:3C:4D:5E",
      model: "IOT AC #9",
      vendor: "Machine Sense",
      notes: "Mock AC",
      position: {
        x: 742.7063112048392,
        y: 24.455844122715675,
        z: -29.93116166102085,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      mode: "ACTIVE",
      show: true,
    },
    {
      id: 10,
      uniqueId: "mockAC #10",
      title: "Machine Sense #10",
      ip: "192.168.159.209",
      mac: "00:1A:2B:3C:4D:5E",
      model: "IOT AC #10",
      vendor: "Machine Sense",
      notes: "Mock AC",
      position: {
        x: 741.4418491409406,
        y: 24.455844122715675,
        z: 32.66666774988795,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      mode: "ACTIVE",
      show: true,
    },
    {
      id: 11,
      uniqueId: "mockAC #11",
      title: "Machine Sense #11",
      ip: "192.168.159.210",
      mac: "00:1A:2B:3C:4D:5E",
      model: "IOT AC #11",
      vendor: "Machine Sense",
      notes: "Mock AC",
      position: {
        x: 756.6697122010439,
        y: 24.455844122715675,
        z: 131.32894867933527,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      mode: "ACTIVE",
      show: true,
    },
    {
      id: 12,
      uniqueId: "mockAC #12",
      title: "Machine Sense #12",
      ip: "192.168.159.211",
      mac: "00:1A:2B:3C:4D:5E",
      model: "IOT AC #12",
      vendor: "Machine Sense",
      notes: "Mock AC",
      position: {
        x: 851.3070560657316,
        y: 24.455844122715675,
        z: 127.67873842602951,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      mode: "ACTIVE",
      show: true,
    },
    {
      id: 13,
      uniqueId: "mockAC #13",
      title: "Machine Sense #13",
      ip: "192.168.159.212",
      mac: "00:1A:2B:3C:4D:5E",
      model: "IOT AC #1",
      vendor: "Machine Sense",
      notes: "Mock AC",
      position: {
        x: 903.0095858500986,
        y: 24.455844122715675,
        z: -8.574628722676271,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      mode: "ACTIVE",
      show: true,
    },
  ]);
  return (
    <>
      <ambientLight intensity={2} />
      <pointLight position={[900, 50, 130]} intensity={10} color={"white"} />
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
      {ShowAC &&
        mockACs.map((ac) => (
          <AC ac={ac} isDeveloping={false} key={ac.uniqueId + ac.id} />
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
