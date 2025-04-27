"use client";
import { useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useRef } from 'react';
import Character from './Character';
import Bunker from './Bunker'; // Your bunker model
import { OrbitControls } from '@react-three/drei';

export default function SceneContent() {
  const { camera } = useThree();
  const characterBodyRef = useRef();

  return (
    <Physics gravity={[0, -9.81, 0]}>
         <ambientLight intensity={0.5} />
         <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      {/* Character */}
      <Character ref={characterBodyRef} cameraRef={camera} />
      
      {/* Your environment */}
      <Bunker />

      {/* (Optional) OrbitControls for debugging */}
      {/* <OrbitControls /> */}
    </Physics>
  );
}
