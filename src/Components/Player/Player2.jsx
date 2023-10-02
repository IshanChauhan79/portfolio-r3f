import * as THREE from "three";
import {
  OrbitControls,
  useAnimations,
  useGLTF,
  useKeyboardControls,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody, useRapier } from "@react-three/rapier";
import React, { useEffect, useRef, useState } from "react";
import { RESTING, RUNNING } from "../../Constants/animtions";

const directionOffset = ({ forward, backward, leftward, rightward }) => {
  let directionOffset = 0; //w

  if (forward) {
    if (leftward) directionOffset = Math.PI / 4; //w+a
    else if (rightward) directionOffset = -Math.PI / 4; //w+d
  } else if (backward) {
    if (leftward) directionOffset = Math.PI / 2; // s + a
    else if (rightward) directionOffset = -Math.PI / 2; // s + d
    else {
      directionOffset = Math.PI; // s
    }
  } else if (leftward) {
    directionOffset = Math.PI / 2; // a
  } else if (rightward) {
    directionOffset = -Math.PI / 2; // d
  }
  return directionOffset;
};

const walkDirection = new THREE.Vector3();
const rotateAngle = new THREE.Vector3();
const cameraTarget = new THREE.Vector3();
const rottateQuaternion = new THREE.Quaternion();

const Player = ({ position = [0, 0, 0] }) => {
  // load model
  const playerModel = useGLTF("/player.gltf");
  const { scene, animations, nodes } = playerModel;
  // remove goblin
  nodes.Armature_cavalier.visible = false;
  //   cast shadow
  Object.values(nodes).forEach((el) => {
    el.castShadow = true;
  });

  /**
   * states
   */

  // camera state
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(10, 10, 10)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());

  // player related things
  const orbitControl = useRef();
  const playerRef = useRef(null);
  const [playerPosition] = useState({
    x: position[0],
    y: position[1],
    z: position[2],
  });

  // animations realated things

  const [playerAnimation, setPlayerAnimation] = useState(RESTING);
  const wolfAnimations = [animations[2], animations[3]];
  const workingAnimations = useAnimations(wolfAnimations, scene);

  /**
   * controls
   */
  const [_, getKeys] = useKeyboardControls();

  // physics
  const { rapier, world } = useRapier();

  useEffect(() => {
    let animationName = workingAnimations.names[1];
    if (playerAnimation === RUNNING) {
      animationName = workingAnimations.names[0];
    }
    console.log(
      "🚀 ~ file: index.jsx:79 ~ useEffect ~ animationName:",
      animationName
    );
    const action = workingAnimations.actions[animationName];
    action.reset().fadeIn(0.5).play();
    return () => {
      action.fadeOut(0.5);
    };
  }, [playerAnimation]);

  const updateCamera = ({ moveX, moveZ, camera }) => {
    // move camera
    camera.position.x += moveX;
    camera.positio.z += moveZ;

    // update camera

    cameraTarget.x = scene.position.x;
    cameraTarget.y = scene.position.y + 2;
    cameraTarget.z = scene.position.z;
    if (orbitControl?.current) orbitControl.current.target = camera;
  };

  useFrame((state, delta) => {
    const camera = state.camera;
    const time = state.clock.getElapsedTime();
    const { forward, backward, leftward, rightward } = getKeys();
    const velocity = 5;

    const movePlayer = () => {
      let angleYcameraDirection = Math.atan2(
        camera.position.x - scene.position.x,
        camera.position.z - scene.position.z
      );

      let newDirectionOffset = directionOffset({
        leftward,
        rightward,
        backward,
        forward,
      });

      rottateQuaternion.setFromAxisAngle(
        rotateAngle,
        angleYcameraDirection + newDirectionOffset
      );

      camera.getWorldDirection(walkDirection);
      walkDirection.y = 0;
      walkDirection.normalize();
      walkDirection.applyAxisAngle(rotateAngle, newDirectionOffset);

      const moveX = walkDirection.x * velocity * delta;
      const moveZ = walkDirection.z * velocity * delta;
      console.log("🚀 ~ file: index.jsx:142 ~ movePlayer ~ moveZ:", moveZ);
      scene.position.x += moveX;
      scene.position.z += moveZ;
    };

    if (forward || backward || leftward || rightward) {
      setPlayerAnimation(RUNNING);
      if (playerRef?.current) {
        movePlayer();
      }
    } else {
      setPlayerAnimation(RESTING);
    }
  });

  return (
    <>
      <OrbitControls ref={orbitControl} makeDefault />
      <group position={position}>
        <primitive
          object={scene}
          ref={playerRef}
          rotation-y={Math.PI}
          castshadow
          flatShading
        />

        {/* <RigidBody
          ref={playerRef}
          type="kinematicPosition"
          colliders={false}
          //   scale={0.5}
          rotation-y={Math.PI}
        >
          <CuboidCollider args={[0.17, 0.4, 0.6]} position={[0, 0.4, 0]} />
          <primitive object={scene} castshadow flatShading />
        </RigidBody> */}
      </group>
    </>
  );
};

export default Player;
