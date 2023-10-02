import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { GROUND_SCALE } from "../../Constants/renderRelated";

const Boundary = ({ scale = GROUND_SCALE }) => {
  const size = Math.ceil(scale / 2);
  return (
    <RigidBody type="fixed">
      <CuboidCollider args={[size, 2, 0.3]} position={[0, 1, size]} />
      <CuboidCollider args={[size, 2, 0.3]} position={[0, 1, -size]} />
      <CuboidCollider args={[0.3, 2, size]} position={[size, 1, 0]} />
      <CuboidCollider args={[0.3, 2, size]} position={[-size, 1, 0]} />
    </RigidBody>
  );
};

export default Boundary;
