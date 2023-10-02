import * as THREE from "three";
import { useGLTF, useAnimations, useKeyboardControls } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RESTING, RUNNING } from "../../Constants/animtions";

const Player = ({ position = [0, 0, 0] }) => {
  const playerModel = useGLTF("/player.gltf");

  const { scene, animations, nodes } = playerModel;
  const wolfAnimations = [animations[2], animations[3]];

  /**
   * states
   */
  // camera states
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(10, 10, 10)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());
  const [playerAnimation, setPlayerAnimation] = useState(RESTING);
  const [playerPosition] = useState({
    x: position[0],
    y: position[1],
    z: position[2],
  });

  // remove goblin
  nodes.Armature_cavalier.visible = false;
  //   cast shadow
  Object.values(nodes).forEach((el) => {
    el.castShadow = true;
  });

  /**
   * animations
   */
  const workingAnimations = useAnimations(wolfAnimations, scene);

  /**
   * controls
   */
  const [_, getKeys] = useKeyboardControls();
  console.log("hello");
  /**
   * refs
   */
  const playerRef = useRef(null);

  useEffect(() => {
    let animationName = workingAnimations.names[1];
    if (playerAnimation === RUNNING) {
      animationName = workingAnimations.names[0];
    }
    const action = workingAnimations.actions[animationName];
    action.reset().fadeIn(0.5).play();
    return () => {
      action.fadeOut(0.5);
    };
  }, [playerAnimation]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const { forward, backward, leftward, rightward } = getKeys();

    if (forward || backward || leftward || rightward) {
      setPlayerAnimation(RUNNING);
    } else {
      setPlayerAnimation(RESTING);
    }

    if (playerRef?.current) {
      //   const newPosition = {};

      if (forward) {
        playerPosition.z -= 0.0015 * time;
        playerRef.current.setNextKinematicTranslation(playerPosition);
      }
      if (leftward) {
        playerPosition.x -= 0.0015 * time;
        playerRef.current.setNextKinematicTranslation(playerPosition);
      }
      if (rightward) {
        playerPosition.x += 0.0015 * time;
        playerRef.current.setNextKinematicTranslation(playerPosition);
      }
    }
  });

  console.log("🚀 ~ file: index.jsx:92 ~ Player ~ playerRef:", playerRef);
  return (
    <>
      <group position={position}>
        <RigidBody
          ref={playerRef}
          type="kinematicPosition"
          colliders={false}
          //   scale={0.5}
          rotation-y={Math.PI}
        >
          <CuboidCollider args={[0.17, 0.5, 0.6]} position={[0, 0.5, 0]} />
          <primitive object={scene} castshadow flatShading />
        </RigidBody>
      </group>
    </>
  );
};

export default Player;

/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

// import React, { useRef } from "react";
// import { useGLTF, useAnimations } from "@react-three/drei";

// export default function Model(props) {
//   const group = useRef()
//   const { nodes, materials, animations } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/korrigan-wolf/model.gltf')
// const { actions } = useAnimations(animations, group)
//   return (
//     <group ref={group} {...props} dispose={null}>
// <group rotation={[0, 0.48, 0,]} scale={0.15} >
// <primitive object={nodes.root} />
// <skinnedMesh geometry={nodes.Cavalier.geometry} material={materials['color_main.015']} skeleton={nodes.Cavalier.skeleton} />
// </group>
// <group scale={0.61} >
// <primitive object={nodes.spine004} />
// <skinnedMesh geometry={nodes.Loup.geometry} material={materials['color_main.002']} skeleton={nodes.Loup.skeleton} />
// </group>

//     </group>
//   )
// }

// useGLTF.preload('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/korrigan-wolf/model.gltf')
