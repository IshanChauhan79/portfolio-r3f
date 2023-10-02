import { OrbitControls, PointerLockControls, Sky } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Perf } from "r3f-perf";
import Lights from "../Utility/Lights";
import Ground from "../Components/Ground";
import Player from "../Components/Player";

const CanvasContent = () => {
  return (
    <>
      {/* performance */}
      <Perf position="top-left" />

      {/* <Environment preset="city" /> */}
      {/* <color attach="background" args={["black"]} /> */}
      <Sky sunPosition={[100, 20, 100]} />

      {/* lights for the scene */}
      <Lights />

      <Physics debug>
        <Ground />
        <Player position={[0, 0, 4]} />
      </Physics>

      {/* <PointerLockControls makeDefault /> */}

      <axesHelper scale={5} />
    </>
  );
};

export default CanvasContent;
