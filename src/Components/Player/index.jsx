import * as THREE from "three";
import {
  OrbitControls,
  useAnimations,
  useGLTF,
  useKeyboardControls,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BallCollider,
  CuboidCollider,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { RESTING, RUNNING } from "../../Constants/animtions";

/**
 * Calculate the target rotation for the body based on the camera and character position.
 *
 * @param {Vector3} cameraPosition - Position of the camera
 * @param {Vector3} characterPosition - Position of the character
 * @param {number} additionalRotation - Additional rotation for selected direction
 * @returns {number} Target rotation
 */
function calculateTargetRotation(
  cameraPosition,
  characterPosition,
  additionalRotation
) {
  return (
    Math.atan2(
      cameraPosition.x - characterPosition.x,
      cameraPosition.z - characterPosition.z
    ) + additionalRotation
  );
}

/**
 * Smoothly interpolate the current body rotation towards the target rotation.
 *
 * @param {number} currentRotation - Current body rotation
 * @param {number} targetRotation - Target body rotation
 * @param {number} rotationSpeed - Speed of rotation interpolation
 * @param {number} delta - Time since last frame
 * @returns {number} Smoothed rotation value
 */
function smoothRotation(currentRotation, targetRotation, rotationSpeed, delta) {
  // Calculate the rotation difference
  let rotationDifference = targetRotation - currentRotation;

  // Adjust the rotation difference to choose the shorter path
  if (rotationDifference > Math.PI) {
    rotationDifference -= 2 * Math.PI;
  } else if (rotationDifference < -Math.PI) {
    rotationDifference += 2 * Math.PI;
  }

  return currentRotation + rotationDifference * rotationSpeed * delta;
}

const Player = ({ position = [0, 0, 0] }) => {
  // load model
  const playerModel = useGLTF("/player.gltf");
  const { scene, animations, nodes } = playerModel;
  // remove goblin
  nodes.Armature_cavalier.visible = false;
  //   cast shadow
  Object.values(nodes).forEach((el) => {
    el.castShadow = true;
    el.receiveShadow = true;
  });

  // player related things
  const orbitControl = useRef();
  const playerRBodyRef = useRef(null);
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

  //used for lerping
  const [cameraSpeed, setCameraSpeed] = useState(4);
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(20, 10, 10)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());

  // Handle camera and body rotation (initially have a 45 degree angle)
  const [rotationAngle] = useState({ angle: Math.PI / 4 });
  const cameraDistance = 5;

  /**
   * Handle Character Rotations Speeds
   */
  // Body rotation speed
  const rotationSpeed = 6;

  // Camera rotation speed
  const cameraTurnSpeed = 0.015;

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

    const action = workingAnimations.actions[animationName];
    action.reset().fadeIn(0.5).play();
    return () => {
      action.fadeOut(0.5);
    };
  }, [playerAnimation]);

  useFrame((state, delta) => {
    if (!(playerRef?.current && playerRBodyRef?.current)) return;
    const camera = state.camera;
    const { forward, backward, leftward, rightward, shift } = getKeys();

    /**
     * Speed
     */
    // Adjust the speed based on whether shift is pressed or not
    const speed = shift ? 8 : 5;
    const impulse = { x: 0, y: 0, z: 0 };

    // Movement Direction represents the direction in which the player should move forward or backward based on the camera's rotation
    const movementDirection = new THREE.Vector3(
      Math.sin(rotationAngle.angle),
      0,
      Math.cos(rotationAngle.angle)
    );

    if (forward && backward) {
      //not necessary to write just for explanation
      // Handle simultaneous press of "left" and "right" buttons
      impulse.x = 0; // No movement in the x-axis
      impulse.z = 0; // No movement in the z-axis

      // Update cameraSpeed on move.
      setCameraSpeed(10);

      setPlayerAnimation(RESTING);
    } else if (
      (forward && !leftward && !rightward) ||
      (forward && leftward && rightward)
    ) {
      // Handle forward movement (F)
      impulse.x = movementDirection.x * -speed * delta;
      impulse.z = movementDirection.z * -speed * delta;

      // Calc target rotation for forward
      const targetRotation = calculateTargetRotation(
        camera.position,
        playerRBodyRef.current.translation(),
        (7 * Math.PI) / 4
      );

      // Interpolate current with target
      const smoothedRotation = smoothRotation(
        playerRef.current.rotation.y,
        targetRotation,
        rotationSpeed,
        delta
      );

      // Keep the rotation within the range of 0 and 2π
      playerRef.current.rotation.y =
        (2 * Math.PI + smoothedRotation) % (2 * Math.PI);

      // Set animation name based on movement speed
      setPlayerAnimation(RUNNING);

      // Update cameraSpeed on move.
      setCameraSpeed(10);
    } else if (
      (backward && !leftward && !rightward) ||
      (backward && leftward && rightward)
    ) {
      // Handle backward movement (B)
      impulse.x = movementDirection.x * speed * delta;
      impulse.z = movementDirection.z * speed * delta;

      // Calc target rotation for backward
      const targetRotation = calculateTargetRotation(
        state.camera.position,
        playerRBodyRef.current.translation(),
        (3 * Math.PI) / 4
      );

      // Interpolate current with target
      const smoothedRotation = smoothRotation(
        playerRef.current.rotation.y,
        targetRotation,
        rotationSpeed,
        delta
      );

      // Keep the rotation within the range of 0 and 2π
      playerRef.current.rotation.y =
        (2 * Math.PI + smoothedRotation) % (2 * Math.PI);

      // Set animation name based on movement speed
      setPlayerAnimation(RUNNING);

      // Update cameraSpeed on move.
      setCameraSpeed(10);
    } else if (leftward && rightward) {
      // Handle simultaneous press of "left" and "right" buttons
      impulse.x = 0; // No movement in the x-axis
      impulse.z = 0; // No movement in the z-axis

      // Set animation name to "Idle"
      setPlayerAnimation(RESTING);

      // Update cameraSpeed on move.
      setCameraSpeed(10);
    } else if (leftward && !forward && !backward) {
      // Handle leftward movement (L)
      impulse.x = -movementDirection.z * speed * delta;
      impulse.z = movementDirection.x * speed * delta;

      // Calc target rotation for leftward
      const targetRotation = calculateTargetRotation(
        state.camera.position,
        playerRBodyRef.current.translation(),
        Math.PI / 4
      );

      // Interpolate current with target
      const smoothedRotation = smoothRotation(
        playerRef.current.rotation.y,
        targetRotation,
        rotationSpeed,
        delta
      );

      // Keep the rotation within the range of 0 and 2π
      playerRef.current.rotation.y =
        (2 * Math.PI + smoothedRotation) % (2 * Math.PI);

      // Set animation name based on movement speed
      setPlayerAnimation(RUNNING);

      // Apply left camera rotation using cameraTurnSpeed [+ for left]
      rotationAngle.angle = rotationAngle.angle + cameraTurnSpeed;

      // Update cameraSpeed on move.
      setCameraSpeed(10);
    } else if (rightward && !forward && !backward) {
      // Handle rightward movement (R)
      impulse.x = movementDirection.z * speed * delta;
      impulse.z = -movementDirection.x * speed * delta;

      // Calc target rotation for rightward
      const targetRotation = calculateTargetRotation(
        state.camera.position,
        playerRBodyRef.current.translation(),
        (5 * Math.PI) / 4
      );

      // Interpolate current with target
      const smoothedRotation = smoothRotation(
        playerRef.current.rotation.y,
        targetRotation,
        rotationSpeed,
        delta
      );

      // Keep the rotation within the range of 0 and 2π
      playerRef.current.rotation.y =
        (2 * Math.PI + smoothedRotation) % (2 * Math.PI);

      // Set animation name based on movement speed
      setPlayerAnimation(RUNNING);

      // Apply right camera rotation using cameraTurnSpeed [- for right]
      rotationAngle.angle = rotationAngle.angle - cameraTurnSpeed;

      // Update cameraSpeed on move.
      setCameraSpeed(10);
    } else if (forward && leftward) {
      // Handle simultaneous press of "left" and "forward" buttons (FL)
      impulse.x = (-movementDirection.x - movementDirection.z) * speed * delta;
      impulse.z = (-movementDirection.z + movementDirection.x) * speed * delta;

      // Calc target rotation for forward && leftward
      const targetRotation = calculateTargetRotation(
        state.camera.position,
        playerRBodyRef.current.translation(),
        0
      );

      // Interpolate current with target
      const smoothedRotation = smoothRotation(
        playerRef.current.rotation.y,
        targetRotation,
        rotationSpeed,
        delta
      );

      playerRef.current.rotation.y =
        (2 * Math.PI + smoothedRotation) % (2 * Math.PI);

      // Set animation name based on movement speed
      setPlayerAnimation(RUNNING);

      // Apply left camera rotation using cameraTurnSpeed [+ for left]
      rotationAngle.angle = rotationAngle.angle + cameraTurnSpeed;

      // Update cameraSpeed on move.
      setCameraSpeed(10);
    } else if (forward && rightward) {
      // Handle simultaneous press of "left" and "forward" buttons (FR)
      impulse.x = (movementDirection.x - movementDirection.z) * -speed * delta;
      impulse.z = (movementDirection.z + movementDirection.x) * -speed * delta;

      // Calc target rotation for forward && rightward
      const targetRotation = calculateTargetRotation(
        state.camera.position,
        playerRBodyRef.current.translation(),
        (3 * Math.PI) / 2
      );

      // Interpolate current with target
      const smoothedRotation = smoothRotation(
        playerRef.current.rotation.y,
        targetRotation,
        rotationSpeed,
        delta
      );

      // Keep the rotation within the range of 0 and 2π
      playerRef.current.rotation.y =
        (2 * Math.PI + smoothedRotation) % (2 * Math.PI);

      // Set animation name based on movement speed
      setPlayerAnimation(RUNNING);

      // Apply right camera rotation using cameraTurnSpeed [- for right]
      rotationAngle.angle = rotationAngle.angle - cameraTurnSpeed;

      // Update cameraSpeed on move.
      setCameraSpeed(10);
    } else if (backward && leftward) {
      // Handle simultaneous press of "right" and "backward" buttons (BL)
      impulse.x = (movementDirection.x - movementDirection.z) * speed * delta;
      impulse.z = (movementDirection.z + movementDirection.x) * speed * delta;

      // Calc target rotation for backward && leftward
      const targetRotation = calculateTargetRotation(
        state.camera.position,
        playerRBodyRef.current.translation(),
        Math.PI / 2
      );

      // Interpolate current with target
      const smoothedRotation = smoothRotation(
        playerRef.current.rotation.y,
        targetRotation,
        rotationSpeed,
        delta
      );

      // Keep the rotation within the range of 0 and 2π
      playerRef.current.rotation.y =
        (2 * Math.PI + smoothedRotation) % (2 * Math.PI);

      // Set animation name based on movement speed
      setPlayerAnimation(RUNNING);

      // Apply left camera rotation using cameraTurnSpeed [+ for left]
      rotationAngle.angle = rotationAngle.angle + cameraTurnSpeed;

      // Update cameraSpeed on move.
      setCameraSpeed(10);
    } else if (backward && rightward) {
      // Handle simultaneous press of "left" and "backward" buttons (BR)
      impulse.x = (-movementDirection.x - movementDirection.z) * -speed * delta;
      impulse.z = (-movementDirection.z + movementDirection.x) * -speed * delta;

      // Calc target rotation for backward && rightward
      const targetRotation = calculateTargetRotation(
        state.camera.position,
        playerRBodyRef.current.translation(),
        Math.PI
      );

      // Interpolate current with target
      const smoothedRotation = smoothRotation(
        playerRef.current.rotation.y,
        targetRotation,
        rotationSpeed,
        delta
      );

      // Keep the rotation within the range of 0 and 2π
      playerRef.current.rotation.y =
        (2 * Math.PI + smoothedRotation) % (2 * Math.PI);

      // Set animation name based on movement speed
      setPlayerAnimation(RUNNING);

      // Apply right camera rotation using cameraTurnSpeed [- for right]
      rotationAngle.angle = rotationAngle.angle - cameraTurnSpeed;

      // Update cameraSpeed on move.
      setCameraSpeed(10);
    } else {
      setPlayerAnimation(RESTING);
    }

    // Apply impulse on playerRef
    playerRBodyRef.current.applyImpulse(impulse);
    playerRBodyRef.current.applyTorqueImpulse(impulse);

    // Body position for both Camera and phases
    const bodyPosition = playerRBodyRef.current.translation();

    /**
     * Camera
     */
    if (true) {
      // Update camera
      const cameraRotation = THREE.MathUtils.lerp(
        rotationAngle.angle,
        rotationAngle.angle,
        10 * delta
      );

      // Calculate cameras position relative to the body
      const cameraPosition = new THREE.Vector3();
      cameraPosition.copy(bodyPosition);
      cameraPosition.x += Math.sin(cameraRotation) * cameraDistance;
      cameraPosition.z += Math.cos(cameraRotation) * cameraDistance;
      cameraPosition.y += 4; // Adjust the camera's vertical position if needed

      // Position target slightly above playerRef's body
      const cameraTarget = new THREE.Vector3();
      cameraTarget.copy(bodyPosition);
      cameraTarget.y += 2;

      // Interpolate current position with new position over time at a fixed refresh rate ( > 10 is faster movement)
      smoothedCameraPosition.lerp(cameraPosition, cameraSpeed * delta);
      smoothedCameraTarget.lerp(cameraTarget, cameraSpeed * delta);

      // Update camera
      state.camera.position.copy(smoothedCameraPosition);
      state.camera.lookAt(smoothedCameraTarget);
    }
  });

  return (
    <>
      {/* <OrbitControls ref={orbitControl} makeDefault /> */}
      <group position={position}>
        <RigidBody
          ref={playerRBodyRef}
          colliders={false}
          //   scale={0.5}
          rotation-y={Math.PI * 1.25}
          friction={1.5}
          linearDamping={1.25}
          angularDamping={1.25}
          enabledRotations={[false, false, false]}
          canSleep={false}
        >
          <primitive ref={playerRef} object={scene} castshadow flatShading />
          <BallCollider args={[0.4]} position={[0, 0.4, 0]} />
          {/* <CuboidCollider args={[0.3, 0.3, 0.3]} position={[0, 0.4, 0]} /> */}
        </RigidBody>
      </group>
    </>
  );
};

export default Player;
