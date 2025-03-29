import { useEffect , useRef } from 'react';
import { Mesh, BoxGeometry, MeshStandardMaterial } from 'three';
import { useFrame } from '@react-three/fiber';

interface ModelViewerProps {
  onLoad?: () => void;
}

// Simple placeholder 3D object since we don't have the actual GLB model yet
const ModelViewer = ({ onLoad }: ModelViewerProps) => {
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
};

export default ModelViewer;
