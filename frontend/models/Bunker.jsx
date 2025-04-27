"use client"
import React from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

export default function Bunker(props) {
  const { nodes, materials } = useGLTF('/bunker-transformed.glb')
  
  return (
    <group {...props} dispose={null}>
      {/* Walls */}
      <RigidBody type='fixed' colliders="trimesh">
        <mesh geometry={nodes.wall044_Wall1_0.geometry} material={materials.Wall1} position={[3, 3, -21.3]} rotation={[-Math.PI / 2, 0, 0]} />
      </RigidBody>
      
      {/* Ceiling */}
      <RigidBody type='fixed' colliders="trimesh">
        <mesh geometry={nodes.ceiling011_Ceiling1_0.geometry} material={materials.Ceiling1} position={[-1.5, 1.5, -18.3]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} />
      </RigidBody>
      
      {/* Floor */}
      <RigidBody type='fixed' colliders="trimesh">
        <mesh geometry={nodes.floor012_Floor1_0.geometry} material={materials.Floor1} position={[1.8, 0.5, 0.3]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} />
      </RigidBody>
      
      {/* Additional Ceiling */}
      <RigidBody type='fixed' colliders="trimesh">
        <mesh geometry={nodes.ceiling013_Ceiling1001_0.geometry} material={materials['Ceiling1.001']} position={[37.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      </RigidBody>
      
      {/* Additional Floor */}
      <RigidBody type='fixed' colliders="trimesh">
        <mesh geometry={nodes.floor015_Floor1001_0.geometry} material={materials['Floor1.001']} position={[30.5, 0, -7]} rotation={[-Math.PI / 2, 0, 0]} />
      </RigidBody>
      
      {/* Stairs */}
      <RigidBody type='fixed' colliders="trimesh">
        <mesh geometry={nodes.stairs004_Wall1001_0.geometry} material={materials['Wall1.001']} position={[42, 0, -9]} rotation={[-Math.PI / 2, 0, 0]} />
      </RigidBody>
    </group>
  )
}

useGLTF.preload('/bunker-transformed.glb')
