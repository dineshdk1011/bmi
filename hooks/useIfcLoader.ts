import { useState, useEffect, useCallback } from 'react';
import { IfcAPI, IFCPRODUCT } from 'web-ifc';
// Fix: Changed import path to load correct types from the package.
import { IFCLoader } from 'web-ifc-three';
import { IfcComponent, IfcProperty } from '../types';
import * as THREE from 'three';

// Define materials for highlighting
const selectionMaterial = new THREE.MeshLambertMaterial({
    color: 0x38b2ac, // highlight color from tailwind config
    opacity: 0.5,
    transparent: true,
    depthTest: false,
});

const blinkMaterial = new THREE.MeshLambertMaterial({
    color: 0xff0000, // Red
    opacity: 0.4,
    transparent: true,
    depthTest: false,
});

// Custom IDs for managing different highlight subsets
const SELECTION_SUBSET_ID = 'selection-subset';
const BLINK_SUBSET_ID = 'blink-subset';


// Extend IFCLoader to add custom methods for better state management
class ExtendedIfcLoader extends IFCLoader {
  // FIX: Explicitly declare properties from the base IFCLoader class
  // to resolve TypeScript type inference issues where it fails to see inherited members.
  public ifcManager: any;
  public loadAsync: (url: string) => Promise<THREE.Group>;

  private blinkTimeout: ReturnType<typeof setTimeout> | null = null;

  setPersistentHighlight(expressID: number) {
    if (!this.ifcManager) return;
    // FIX: The scene property does not exist on IFCManager by default.
    // It is attached at runtime from the Viewer component. Cast to `any` to satisfy TypeScript.
    this.ifcManager.createSubset({
      modelID: 0,
      ids: [expressID],
      material: selectionMaterial,
      scene: (this.ifcManager as any).scene,
      removePrevious: true,
      customID: SELECTION_SUBSET_ID,
    });
  }
  
  blinkHighlight(expressID: number) {
    if (!this.ifcManager) return;
    
    if (this.blinkTimeout) {
        clearTimeout(this.blinkTimeout);
    }

    // FIX: The scene property does not exist on IFCManager by default.
    // It is attached at runtime from the Viewer component. Cast to `any` to satisfy TypeScript.
    this.ifcManager.createSubset({
        modelID: 0,
        ids: [expressID],
        material: blinkMaterial,
        scene: (this.ifcManager as any).scene,
        removePrevious: true,
        customID: BLINK_SUBSET_ID,
    });
    
    this.blinkTimeout = setTimeout(() => {
        this.ifcManager.removeSubset(0, blinkMaterial, BLINK_SUBSET_ID);
        this.blinkTimeout = null;
    }, 1500);
  }

  removeHighlights() {
      if (!this.ifcManager) return;
      this.ifcManager.removeSubset(0, selectionMaterial, SELECTION_SUBSET_ID);
  }

  async getProperties(expressID: number): Promise<IfcProperty[]> {
    if (!this.ifcManager) return [];
    
    try {
      const props = await this.ifcManager.getItemProperties(0, expressID, true);
      const psets = await this.ifcManager.getPropertySets(0, expressID, true);
      
      const extractedProps: IfcProperty[] = [];
      
      const basicProps = ['Name', 'ObjectType', 'GlobalId', 'Description', 'Tag'];
      for (const propName of basicProps) {
        if (props[propName] && props[propName].value !== null && props[propName].value !== undefined) {
          extractedProps.push({ name: propName, value: props[propName].value });
        }
      }
      
      for (const pset of psets) {
        if(pset.HasProperties) {
            for (const prop of pset.HasProperties) {
                const propData = await this.ifcManager.getItemProperties(0, prop.value);
                if (propData.Name && propData.NominalValue) {
                   extractedProps.push({name: propData.Name.value, value: propData.NominalValue?.value ?? 'N/A'});
                }
            }
        }
      }
      
      return extractedProps;

    } catch (e) {
      console.error("Error getting properties:", e);
      return [];
    }
  }
  
  dispose() {
      if(this.blinkTimeout) clearTimeout(this.blinkTimeout);
      this.ifcManager.dispose();
  }
}


export const useIfcLoader = () => {
  const [ifcLoader, setIfcLoader] = useState<ExtendedIfcLoader | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initLoader = async () => {
      try {
        const loader = new ExtendedIfcLoader();
        // Set up the IFC manager with the correct WASM path from the same CDN
        await loader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.55/');
        // FIX: The .init() method does not exist on the IfcAPI from web-ifc.
        // It's part of web-ifc-viewer, which is not being used here. Initialization is handled by the loader.
        setIfcLoader(loader);
      } catch (e) {
        console.error("Error initializing IFC loader:", e);
        setError("Failed to initialize viewer engine. Please refresh the page.");
      }
    };
    initLoader();
  }, []);

  const loadIfc = useCallback(async (file: File) => {
    if (!ifcLoader) {
      setError("Viewer is not initialized.");
      return { model: null, components: null };
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = URL.createObjectURL(file);
      // FIX: Use `loadAsync` to correctly use promises with await. `load` uses callbacks and returns void.
      const model = await ifcLoader.loadAsync(url);
      
      // Get all physical elements (products) from the model
      const ids = await ifcLoader.ifcManager.getAllItemsOfType(0, IFCPRODUCT, false);
      const components: IfcComponent[] = [];
      for (const id of ids) {
        const props = await ifcLoader.ifcManager.getItemProperties(0, id, false);
        components.push({
            expressID: props.expressID,
            Name: props.Name?.value || 'Unnamed',
            ObjectType: props.ObjectType?.value || 'Not specified'
        });
      }

      setIsLoading(false);
      return { model, components: components.sort((a,b) => a.Name.localeCompare(b.Name)) };
    } catch (e) {
      console.error(e);
      setError(`Failed to load IFC file: ${e instanceof Error ? e.message : String(e)}`);
      setIsLoading(false);
      return { model: null, components: null };
    }
  }, [ifcLoader]);
  
  return { ifcManager: ifcLoader, isLoading, error, loadIfc };
};