"use client";
import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import SceneContent from './SceneContent'; // We'll create this component

export default function GameScene() {
  return (
    <Canvas
      style={{ width: '100vw', height: '100vh' }}
      camera={{ position: [0, 5, 10], fov: 60 }}
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
