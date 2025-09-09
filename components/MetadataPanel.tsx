
import React from 'react';
import { IfcComponent, IfcProperty } from '../types';

interface MetadataPanelProps {
  component: IfcComponent | null;
  properties: IfcProperty[] | null;
}

export default function MetadataPanel({ component, properties }: MetadataPanelProps) {
  if (!component) {
    return (
      <div className="p-4 border-t border-accent text-text-secondary text-sm">
        Select a component to view its properties.
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 p-2 border-t border-accent max-h-1/3 flex flex-col">
       <h2 className="text-lg font-bold text-text-primary mb-2 px-2">Properties</h2>
       <div className="overflow-y-auto px-2 pr-3 text-sm">
            <div className="grid grid-cols-3 gap-x-2 py-1 border-b border-accent">
                <span className="font-semibold col-span-1 text-text-secondary">Name</span>
                <span className="col-span-2 text-text-primary truncate" title={component.Name}>{component.Name}</span>
            </div>
             <div className="grid grid-cols-3 gap-x-2 py-1 border-b border-accent">
                <span className="font-semibold col-span-1 text-text-secondary">Type</span>
                <span className="col-span-2 text-text-primary truncate" title={component.ObjectType}>{component.ObjectType}</span>
            </div>
             <div className="grid grid-cols-3 gap-x-2 py-1 border-b border-accent">
                <span className="font-semibold col-span-1 text-text-secondary">ID</span>
                <span className="col-span-2 text-text-primary">{component.expressID}</span>
            </div>
           {properties ? (
            properties.map((prop, index) => (
              <div key={index} className="grid grid-cols-3 gap-x-2 py-1 border-b border-accent">
                <span className="font-semibold col-span-1 text-text-secondary truncate" title={prop.name}>{prop.name}</span>
                <span className="col-span-2 text-text-primary truncate" title={String(prop.value)}>{String(prop.value)}</span>
              </div>
            ))
          ) : (
            <p className="text-text-secondary mt-2">Loading properties...</p>
          )}
       </div>
    </div>
  );
}
