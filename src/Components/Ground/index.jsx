import { RigidBody } from "@react-three/rapier";
import { PLANE_GEOMETRY_1_1 } from "../../Constants/Geometries";
import { STANDARD_MATERIAL_GRASS } from "../../Constants/Materials";
import { GROUND_SCALE } from "../../Constants/renderRelated";
import Boundary from "./Boundary";

const Ground = ({ position = [0, 0, 0], scale = GROUND_SCALE }) => {
  return (
    <group position={position}>
      <RigidBody type="fixed">
        <mesh
          geometry={PLANE_GEOMETRY_1_1}
          material={STANDARD_MATERIAL_GRASS}
          rotation-x={-Math.PI * 0.5}
          scale={scale}
          receiveShadow
          castShadow
          userData={{ camExcludeCollision: true }}
        ></mesh>
        <mesh scale={[0.5, 0.05, 0.5]} position={[2, 0.025, 3]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh scale={[0.5, 0.05, 0.5]} position={[3, 0.025, 3]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh scale={[0.5, 0.05, 0.5]} position={[4, 0.025, 3]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh scale={[0.5, 0.05, 0.5]} position={[2, 0.025, 4]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh scale={[0.5, 0.05, 0.5]} position={[3, 0.025, 4]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh scale={[0.5, 0.05, 0.5]} position={[4, 0.025, 4]} castShadow>
          <boxGeometry />
          <meshStandardMaterial color="red" />
        </mesh>
      </RigidBody>
      <Boundary scale={scale} />
    </group>
  );
};

export default Ground;
