"use client";
import React, { useRef, useEffect, forwardRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { RigidBody, CapsuleCollider, quat } from '@react-three/rapier';
import * as THREE from 'three';

const Character = forwardRef((props, ref) => {
  const { scene, animations } = useGLTF('/man.glb');
  const modelRef = useRef();
  const { actions } = useAnimations(animations, modelRef);
  const walkAction = actions['Take 001'];

  const body = useRef();
  const [yaw, setYaw] = useState(0);
  const isPointerLocked = useRef(false);
  const cameraRef = useRef();

  useEffect(() => {
    if (ref) {
      if (typeof ref === "function") ref(body.current);
      else ref.current = body.current;
    }
  }, [ref]);

  // Keyboard controls
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
        console.log(`Mouse Move X: ${e.movementX}, Y: ${e.movementY}`);
      }
    };

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === document.body;
      console.log('Pointer Lock State:', isPointerLocked.current ? 'Locked' : 'Unlocked');
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
    if (!body.current) return;

    frontVector.set(0, 0, (keys.current.backward ? 1 : 0) - (keys.current.forward ? 1 : 0));
    sideVector.set((keys.current.left ? 1 : 0) - (keys.current.right ? 1 : 0), 0, 0);
    direction.copy(frontVector).add(sideVector).normalize().multiplyScalar(SPEED);


    if (isPointerLocked.current) {
      targetQuat.setFromAxisAngle(upAxis, yaw);
    } else if (direction.length() > 0) {
      const angle = Math.atan2(direction.x, direction.z);
      targetQuat.setFromAxisAngle(upAxis, angle);
    }

    const currentQuat = quat(body.current.rotation());
    currentQuat.slerp(targetQuat, 0.1);
    body.current.setRotation(currentQuat, true);

    if (modelRef.current) {
      modelRef.current.rotation.y = yaw;
    }

    // Play/stop animation based on movement
    if (direction.length() > 0) {
      walkAction?.play();
    } else {
      walkAction?.stop();
    }


    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(currentQuat);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(currentQuat);

    const movement = new THREE.Vector3();
    if (keys.current.forward) movement.add(forward);
    if (keys.current.backward) movement.sub(forward);
    if (keys.current.left) movement.sub(right);
    if (keys.current.right) movement.add(right);

    movement.normalize().multiplyScalar(SPEED);

    const vel = body.current.linvel();
    body.current.setLinvel({
      x: movement.x,
      y: vel.y, 
      z: movement.z
    }, true);

   
    if (cameraRef.current) {

      const offset = new THREE.Vector3(0, 2, -8); 
      const cameraPosition = body.current.translation().clone().add(offset);

      cameraRef.current.position.copy(cameraPosition); 

      cameraRef.current.lookAt(body.current.translation().x, body.current.translation().y + 1, body.current.translation().z); // Slightly adjusted to look at the character
    }
  });

  return (
    <RigidBody
      ref={body}
      colliders={false}
      type="dynamic"
      mass={1}
      friction={1}
      restitution={0} // No bouncing
      enabledRotations={[false, true, false]}
    >
      <CapsuleCollider args={[0.4, 0.9]} /> {/* radius, height */}
      <primitive ref={modelRef} object={scene} scale={0.01} position={[0, 1, 0]} />
    </RigidBody>
  );
});

export default Character;
