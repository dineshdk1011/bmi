/// <reference types="@react-three/fiber" />
import React, { useEffect } from 'react';
// FIX: import useThree to get access to the scene
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

interface ViewerProps {
  model: any | null;
  ifcManager: any | null;
  onSelect: (expressID: number | null) => void;
  hiddenIds: Set<number>;
}

const ViewerContent: React.FC<ViewerProps> = ({ model, ifcManager, onSelect, hiddenIds }) => {
    // FIX: Get scene from R3F context to provide it to the IFC manager for highlighting subsets.
    const { scene } = useThree();
    useEffect(() => {
        if (ifcManager) {
            // The ifcManager from web-ifc doesn't have a scene property, but the custom highlighting
            // functions in this app expect one. We attach it dynamically here.
            (ifcManager.ifcManager as any).scene = scene;
        }
    }, [ifcManager, scene]);

    useEffect(() => {
        if (ifcManager && model) {
            // This approach creates a subset of items to hide.
            // If there are items to hide, create/update the subset.
            if (hiddenIds.size > 0) {
                 ifcManager.ifcManager.createSubset({
                    modelID: 0,
                    ids: Array.from(hiddenIds),
                    removePrevious: true,
                    applyToMesh: true,
                    visible: false,
                    customID: 'hidden-subset'
                });
            } else {
                 // If no items are hidden, remove the subset to make all visible.
                 ifcManager.ifcManager.removeSubset(0, undefined, 'hidden-subset');
            }
        }
    }, [hiddenIds, model, ifcManager]);

    const handleClick = (event: ThreeEvent<MouseEvent>) => {
        if (!ifcManager || !model) return;
        
        // Stop propagation to avoid interfering with orbit controls
        event.stopPropagation();

        // Use the intersection data from the event to find the clicked component
        const intersection = event.intersections[0];
        if (!intersection || intersection.faceIndex === undefined) {
            onSelect(null); // Clicked on empty space
            return;
        }
        
        // Fix: Cast the intersected object to THREE.Mesh to access its geometry property.
        const expressID = ifcManager.ifcManager.getExpressId((intersection.object as THREE.Mesh).geometry, intersection.faceIndex);

        if (expressID === undefined) {
            onSelect(null);
        } else {
            onSelect(expressID);
        }
    };
    
    return (
        <>
            <ambientLight intensity={1.2} />
            <directionalLight
                position={[10, 20, 15]}
                intensity={1.5}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            {model && <primitive object={model} onClick={handleClick} />}
            <Grid args={[100, 100]} infiniteGrid fadeDistance={500} />
            <OrbitControls makeDefault />
        </>
    );
};


const Viewer: React.FC<ViewerProps> = (props) => {
  return (
    <div className="w-full h-full cursor-pointer">
      <Canvas
        camera={{ position: [20, 20, 20], fov: 60 }}
        shadows
      >
        <ViewerContent {...props} />
      </Canvas>
    </div>
  );
};

export default Viewer;
