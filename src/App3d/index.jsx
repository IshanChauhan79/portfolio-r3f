import { KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import CanvasContent from "./CanvasContent";

const App3d = () => {
  return (
    <KeyboardControls
      map={[
        { name: "forward", keys: ["ArrowUp", "KeyW", "w", "W"] },
        { name: "backward", keys: ["ArrowDown", "KeyS", "s", "S"] },
        { name: "leftward", keys: ["ArrowLeft", "KeyA", "a", "A"] },
        { name: "rightward", keys: ["ArrowRight", "KeyD", "d", "D"] },
        { name: "jump", keys: ["Space"] },
        { name: "shift", keys: ["Shift"] },
      ]}
    >
      <Canvas
        shadows={true}
        gl={{
          antialias: true,
        }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 100,
          position: [4, 3, 10],
        }}
      >
        <CanvasContent />
      </Canvas>
    </KeyboardControls>
  );
};

export default App3d;
