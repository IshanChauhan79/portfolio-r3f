import { useRef } from "react";
import { useHelper } from "@react-three/drei";
import { DirectionalLightHelper } from "three";

const Lights = () => {
  const directionalLight = useRef(null);
  // useHelper(directionalLight, DirectionalLightHelper, 1);
  return (
    <>
      <directionalLight
        ref={directionalLight}
        castShadow
        position={[50, 50, 50]}
        intensity={1.5}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={100}
        shadow-camera-top={10}
        shadow-camera-right={10}
        shadow-camera-bottom={-10}
        shadow-camera-left={-10}
      />
      <ambientLight intensity={0.5} />
    </>
  );
};

export default Lights;
