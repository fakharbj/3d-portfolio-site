import { a } from "@react-spring/three";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from 'three';

import islandScene from "../assets/3d/island.glb";

export const Island = forwardRef(function Island({
  isRotating,
  setIsRotating,
  setCurrentStage,
  ...props
}, ref) {
  const islandRef = useRef();
  const { gl, viewport } = useThree();
  const { nodes, materials } = useGLTF(islandScene);

  useImperativeHandle(ref, () => islandRef.current);

  const lastX = useRef(0);
  const rotationSpeed = useRef(0);
  const dampingFactor = 0.95;

  const velocity = useRef(0); // 📌 Continuous rotation velocity
  const targetY = useRef(0); // Target Y rotation

  const applyRotation = (delta) => {
    velocity.current += delta * 0.0015; // 📌 Small increment keeps motion natural
  };

  // 🎯 Scroll event: adds to velocity for infinite smooth motion
  const handleWheel = (event) => {
    applyRotation(event.deltaY > 0 ? 1 : -1);
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsRotating(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    lastX.current = clientX;
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    setIsRotating(false);
  };

  const handlePointerMove = (e) => {
    if (!isRotating) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = (clientX - lastX.current) / viewport.width;
    applyRotation(-delta * 10); // Reverse to match expected direction
    lastX.current = clientX;
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      setIsRotating(true);
      applyRotation(1);
    } else if (event.key === "ArrowRight") {
      setIsRotating(true);
      applyRotation(-1);
    }
  };

  const handleKeyUp = (event) => {
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
      setIsRotating(false);
    }
  };

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("touchstart", handlePointerDown);
    canvas.addEventListener("touchend", handlePointerUp);
    canvas.addEventListener("touchmove", handlePointerMove);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("touchstart", handlePointerDown);
      canvas.removeEventListener("touchend", handlePointerUp);
      canvas.removeEventListener("touchmove", handlePointerMove);
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gl]);

  useFrame(() => {
    if (!islandRef.current) return;

    // Smooth rotation logic
    velocity.current *= dampingFactor; // ease out
    targetY.current += velocity.current;
    islandRef.current.rotation.y = targetY.current;

    const normalizedRotation =
      ((islandRef.current.rotation.y % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // Stage detection based on rotation
    switch (true) {
      case normalizedRotation >= 5.45 && normalizedRotation <= 5.85:
        setCurrentStage(4);
        break;
      case normalizedRotation >= 0.85 && normalizedRotation <= 1.3:
        setCurrentStage(3);
        break;
      case normalizedRotation >= 2.4 && normalizedRotation <= 2.6:
        setCurrentStage(2);
        break;
      case normalizedRotation >= 4.25 && normalizedRotation <= 4.75:
        setCurrentStage(1);
        break;
      default:
        setCurrentStage(null);
    }
  });

  return (
    <a.group ref={islandRef} {...props}>
      <mesh geometry={nodes.polySurface944_tree_body_0.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.polySurface945_tree1_0.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.polySurface946_tree2_0.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.polySurface947_tree1_0.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.polySurface948_tree_body_0.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.polySurface949_tree_body_0.geometry} material={materials.PaletteMaterial001} />
      <mesh geometry={nodes.pCube11_rocks1_0.geometry} material={materials.PaletteMaterial001} />
    </a.group>
  );
});
