"use client";
import { useThree, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useRef, useState, useEffect } from 'react';
import Character from './Character';
import Bunker from './Bunker'; // Your existing Bunker model
import * as THREE from "three"
export default function SceneContent() {
  const { camera, gl } = useThree();
  const characterBodyRef = useRef();
  const [isPointerLocked, setPointerLocked] = useState(false);
  const [rotation, setRotation] = useState([0, 0]);

  // Movement state
  const [movement, setMovement] = useState({ forward: false, backward: false, left: false, right: false });

  // Pointer lock handling
  const onMouseMove = (event) => {
    if (!isPointerLocked) return;

    const sensitivity = 0.1;
    const deltaX = event.movementX * sensitivity;
    const deltaY = event.movementY * sensitivity;

    setRotation((prevRotation) => [
      prevRotation[0] - deltaY, // Update vertical rotation (pitch)
      prevRotation[1] + deltaX, // Update horizontal rotation (yaw)
    ]);
  };

  const lockPointer = () => {
    gl.domElement.requestPointerLock();
    setPointerLocked(true);
  };

  const unlockPointer = () => {
    document.exitPointerLock();
    setPointerLocked(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === gl.domElement) {
        setPointerLocked(true);
      } else {
        setPointerLocked(false);
      }
    });

    // Keyboard controls for movement
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'w':
          setMovement((prev) => ({ ...prev, forward: true }));
          break;
        case 's':
          setMovement((prev) => ({ ...prev, backward: true }));
          break;
        case 'a':
          setMovement((prev) => ({ ...prev, left: true }));
          break;
        case 'd':
          setMovement((prev) => ({ ...prev, right: true }));
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key) {
        case 'w':
          setMovement((prev) => ({ ...prev, forward: false }));
          break;
        case 's':
          setMovement((prev) => ({ ...prev, backward: false }));
          break;
        case 'a':
          setMovement((prev) => ({ ...prev, left: false }));
          break;
        case 'd':
          setMovement((prev) => ({ ...prev, right: false }));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', unlockPointer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPointerLocked]);

  // Handle movement and update camera
  useFrame(() => {
    if (characterBodyRef.current) {
      const pos = characterBodyRef.current.translation(); // Get position
      const direction = new THREE.Vector3();

      // Handle movement (forward/backward)
      if (movement.forward) {
        direction.set(0, 0, -1).applyEuler(camera.rotation);
        characterBodyRef.current.setTranslation({
          x: pos.x + direction.x * 0.1,
          y: pos.y,
          z: pos.z + direction.z * 0.1,
        });
      }

      if (movement.backward) {
        direction.set(0, 0, 1).applyEuler(camera.rotation);
        characterBodyRef.current.setTranslation({
          x: pos.x + direction.x * 0.1,
          y: pos.y,
          z: pos.z + direction.z * 0.1,
        });
      }

      // Handle rotation (left/right)
      if (movement.left) {
        camera.rotation.y += 0.05; // Rotate left
      }

      if (movement.right) {
        camera.rotation.y -= 0.05; // Rotate right
      }

      camera.position.set(pos.x, pos.y + 2, pos.z); // Camera follows head, with offset (Y + 1.5)
      camera.rotation.set(rotation[0], rotation[1], 0); // Apply rotation from mouse
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />

      <Physics gravity={[0, -9.81, 0]}>
        <Character ref={characterBodyRef} />
        <Bunker /> {/* Use your existing Bunker model */}
      </Physics>

      
    </>
  );
}
