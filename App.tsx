
import React, { useState, useCallback, useMemo } from 'react';
import { IfcComponent, IfcProperty } from './types';
import { useIfcLoader } from './hooks/useIfcLoader';
import Viewer from './components/Viewer';
import ComponentPanel from './components/ComponentPanel';
import FileUpload from './components/FileUpload';
import LoadingSpinner from './components/LoadingSpinner';
import MetadataPanel from './components/MetadataPanel';

export default function App() {
  const [model, setModel] = useState<any | null>(null);
  const [components, setComponents] = useState<IfcComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<IfcComponent | null>(null);
  const [selectedComponentProps, setSelectedComponentProps] = useState<IfcProperty[] | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());
  
  const { ifcManager, isLoading, error, loadIfc } = useIfcLoader();

  const handleFileLoad = async (file: File) => {
    resetState();
    const { model: loadedModel, components: loadedComponents } = await loadIfc(file);
    if (loadedModel && loadedComponents) {
      setModel(loadedModel);
      setComponents(loadedComponents);
    }
  };

  const resetState = () => {
    setModel(null);
    setComponents([]);
    setSelectedComponent(null);
    setSelectedComponentProps(null);
    setHiddenIds(new Set());
    if (ifcManager) {
      ifcManager.dispose();
    }
  };

  const toggleVisibility = useCallback((expressID: number) => {
    setHiddenIds(prev => {
      const newHiddenIds = new Set(prev);
      if (newHiddenIds.has(expressID)) {
        newHiddenIds.delete(expressID);
      } else {
        newHiddenIds.add(expressID);
      }
      return newHiddenIds;
    });
  }, []);
  
  const highlightComponent = useCallback((expressID: number) => {
    ifcManager?.blinkHighlight(expressID);
  }, [ifcManager]);

  const handleSelectComponent = useCallback(async (expressID: number | null) => {
    if (!ifcManager) return;
    
    if (expressID === null) {
      setSelectedComponent(null);
      setSelectedComponentProps(null);
      ifcManager.removeHighlights();
      return;
    }
    
    const component = components.find(c => c.expressID === expressID);
    if (component) {
      setSelectedComponent(component);
      setSelectedComponentProps(null); // Show loading state for props
      ifcManager.setPersistentHighlight(expressID);
      const props = await ifcManager.getProperties(expressID);
      setSelectedComponentProps(props);
    }
  }, [ifcManager, components]);

  return (
    <div className="h-screen w-screen flex flex-col bg-primary font-sans">
      <header className="flex-shrink-0 bg-secondary shadow-md z-20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-text-primary">BIM IFC Viewer</h1>
          <FileUpload onFileLoad={handleFileLoad} disabled={isLoading} />
        </div>
      </header>

      <main className="flex-grow flex flex-row overflow-hidden">
        <div className="flex-grow h-full relative">
          {isLoading && <LoadingSpinner message="Loading IFC model..." />}
          {error && <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-75 text-white p-4 z-10 text-center">{error}</div>}
          {!model && !isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-text-secondary z-10">
              <p>Upload an .ifc file to begin.</p>
            </div>
          )}
          <Viewer 
            model={model} 
            ifcManager={ifcManager}
            onSelect={handleSelectComponent}
            hiddenIds={hiddenIds}
          />
        </div>

        <aside className="w-[400px] flex-shrink-0 h-full bg-secondary shadow-lg z-10 flex flex-col">
          {model ? (
             <div className="flex-grow flex flex-col h-full overflow-hidden">
              <ComponentPanel
                components={components}
                hiddenIds={hiddenIds}
                selectedComponentId={selectedComponent?.expressID}
                onToggleVisibility={toggleVisibility}
                onHighlight={highlightComponent}
                onSelect={(id) => handleSelectComponent(id)}
              />
               {selectedComponent && (
                <MetadataPanel
                  component={selectedComponent}
                  properties={selectedComponentProps}
                />
              )}
               {!selectedComponent && (
                 <div className="p-4 border-t border-accent text-text-secondary text-sm">
                    Select a component to view its properties.
                 </div>
               )}
            </div>
          ) : (
             <div className="flex items-center justify-center h-full text-text-secondary">
               <p>No model loaded.</p>
             </div>
          )}
        </aside>
      </main>
    </div>
  );
}
