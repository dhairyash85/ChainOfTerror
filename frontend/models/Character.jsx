"use client";
import React, { useRef, useEffect, forwardRef } from 'react';
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
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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

    if (direction.length() > 0) {
      const angle = Math.atan2(direction.x, direction.z);
      targetQuat.setFromAxisAngle(upAxis, angle);
      const currentQuat = quat(body.current.rotation());
      currentQuat.slerp(targetQuat, 0.1);
      body.current.setRotation(currentQuat, true);
      walkAction?.play();
    } else {
      walkAction?.stop();
    }

    const vel = body.current.linvel();
    body.current.setLinvel({ x: direction.x, y: vel.y, z: direction.z }, true);
  });

  return (
    <RigidBody
      ref={body}
      colliders="ball"
      mass={1}
      type="dynamic"
      friction={0.5}
      lockRotations={false}
      enabledRotations={[false, true, false]}
    >
      <CapsuleCollider args={[0.4, 0.9]} />
      <primitive ref={modelRef} object={scene} scale={0.01} position={[0,3,0]} />
    </RigidBody>
  );
});

export default Character;
