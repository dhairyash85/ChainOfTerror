"use client";
import React, { useRef, useEffect, forwardRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { RigidBody, CapsuleCollider, quat } from '@react-three/rapier';
import * as THREE from 'three';

const Character = forwardRef((props, ref) => {
  const { camera } = useThree(); // ⬅️ Grabbing built-in camera directly

  const { scene, animations } = useGLTF('/man.glb');
  const modelRef = useRef();
  const { actions } = useAnimations(animations, modelRef);
  const walkAction = actions['Take 001'];

  const body = useRef();
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const isPointerLocked = useRef(false);

  useEffect(() => {
    if (ref) {
      if (typeof ref === "function") ref(body.current);
      else ref.current = body.current;
    }
  }, [ref]);

  const keys = useRef({ forward: false, backward: false, left: false, right: false });

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
      }
    };

    const handleMouseMove = (e) => {
      if (isPointerLocked.current) {
        setYaw(prev => prev - e.movementX * 0.002);
        setPitch(prev => Math.max(Math.min(prev - e.movementY * 0.002, Math.PI / 2), -Math.PI / 2));
      }
    };

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === document.body;
    };

    const handleClick = () => {
      if (!isPointerLocked.current) {
        document.body.requestPointerLock();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.body.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.body.removeEventListener('click', handleClick);
    };
  }, []);

  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const upAxis = new THREE.Vector3(0, 1, 0);
  const targetQuat = new THREE.Quaternion();
  const SPEED = 5;

  useFrame(() => {
    if (!body.current || !camera) return;
  
    // Calculate movement direction based on keyboard input
    frontVector.set(0, 0, (keys.current.backward ? 1 : 0) - (keys.current.forward ? 1 : 0));
    sideVector.set((keys.current.left ? 1 : 0) - (keys.current.right ? 1 : 0));
    direction.copy(frontVector).add(sideVector).normalize().multiplyScalar(SPEED);
  
    // Apply rotation based on yaw (mouse movement)
    const currentRotation = quat(body.current.rotation());
  
    if (isPointerLocked.current) {
      targetQuat.setFromAxisAngle(upAxis, yaw); // Only update yaw rotation (rotation in place)
    }
  
    currentRotation.slerp(targetQuat, 0.1); // Smoothly interpolate rotation
    body.current.setRotation(currentRotation, true); // Apply the new rotation to the body
  
    if (modelRef.current) {
      modelRef.current.rotation.y = yaw; // Apply yaw to model rotation
    }
  
    // Move the character using keyboard input (no yaw effect on movement)
    const forward = new THREE.Vector3(0, 0, -1);  // No rotation applied to forward direction
    const right = new THREE.Vector3(1, 0, 0);    // No rotation applied to right direction
  
    // Apply rotation to direction vectors based on yaw
    forward.applyQuaternion(currentRotation);
    right.applyQuaternion(currentRotation);
  
    const movement = new THREE.Vector3();
    if (keys.current.forward) movement.add(forward);
    if (keys.current.backward) movement.sub(forward);
    if (keys.current.left) movement.sub(right);
    if (keys.current.right) movement.add(right);
  
    movement.normalize().multiplyScalar(SPEED);
  
    const velocity = body.current.linvel();
    body.current.setLinvel({
      x: movement.x,
      y: velocity.y,
      z: movement.z
    }, true);
  
    // Fix camera to follow the character
    const characterPos = body.current.translation();
    const cameraOffset = new THREE.Vector3(0, 2, 5);
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw); // Apply yaw for camera positioning
  
    const newCameraPos = new THREE.Vector3(
      characterPos.x + cameraOffset.x,
      characterPos.y + cameraOffset.y,
      characterPos.z + cameraOffset.z
    );
  
    camera.position.copy(newCameraPos);
    camera.lookAt(characterPos.x, characterPos.y + 1, characterPos.z); // Keep the camera looking at the character
  });
  
  

  return (
    <RigidBody
      ref={body}
      colliders={false}
      type="dynamic"
      mass={1}
      friction={1}
      restitution={0}
      enabledRotations={[false, true, false]}
    >
      <CapsuleCollider args={[0.4, 0.9]} />
      <primitive ref={modelRef} object={scene} scale={0.0005} position={[0, 2, 0]} />
    </RigidBody>
  );
});

export default Character;
