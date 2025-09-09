
import React, { useState, useMemo } from 'react';
import { IfcComponent } from '../types';

interface ComponentPanelProps {
  components: IfcComponent[];
  hiddenIds: Set<number>;
  selectedComponentId?: number | null;
  onToggleVisibility: (expressID: number) => void;
  onHighlight: (expressID: number) => void;
  onSelect: (expressID: number) => void;
}

const ComponentItem: React.FC<{
  component: IfcComponent;
  isHidden: boolean;
  isSelected: boolean;
  onToggleVisibility: (id: number) => void;
  onHighlight: (id: number) => void;
  onSelect: (id: number) => void;
}> = React.memo(({ component, isHidden, isSelected, onToggleVisibility, onHighlight, onSelect }) => {
  return (
    <li
      className={`flex items-center justify-between p-2 text-sm rounded transition-colors duration-150 ${
        isSelected ? 'bg-highlight bg-opacity-30' : 'hover:bg-accent'
      }`}
    >
      <div className="flex-grow truncate cursor-pointer" onClick={() => onSelect(component.expressID)}>
        <p className="font-semibold text-text-primary truncate" title={component.Name}>{component.Name}</p>
        <p className="text-xs text-text-secondary">{component.ObjectType} (ID: {component.expressID})</p>
      </div>
      <div className="flex-shrink-0 flex items-center space-x-1 ml-2">
        <button
          onClick={() => onToggleVisibility(component.expressID)}
          title={isHidden ? 'Show' : 'Hide'}
          className="p-1 rounded hover:bg-gray-600 transition-colors"
        >
          {isHidden ? <EyeOffIcon /> : <EyeIcon />}
        </button>
        <button
          onClick={() => onHighlight(component.expressID)}
          title="Highlight"
          className="p-1 rounded hover:bg-gray-600 transition-colors"
        >
          <SparklesIcon />
        </button>
      </div>
    </li>
  );
});

export default function ComponentPanel({ components, hiddenIds, selectedComponentId, onToggleVisibility, onHighlight, onSelect }: ComponentPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComponents = useMemo(() => {
    if (!searchTerm) return components;
    return components.filter(c =>
      c.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ObjectType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.expressID.toString().includes(searchTerm)
    );
  }, [components, searchTerm]);

  return (
    <div className="flex flex-col h-full p-2">
       <h2 className="text-lg font-bold text-text-primary mb-2 px-2">Components ({components.length})</h2>
      <div className="px-2 pb-2">
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-primary border border-accent rounded px-3 py-1.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-highlight"
        />
      </div>
      <ul className="overflow-y-auto flex-grow pr-1 space-y-1">
        {filteredComponents.map(component => (
          <ComponentItem
            key={component.expressID}
            component={component}
            isHidden={hiddenIds.has(component.expressID)}
            isSelected={selectedComponentId === component.expressID}
            onToggleVisibility={onToggleVisibility}
            onHighlight={onHighlight}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  );
}

// SVG Icons
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a10.05 10.05 0 013.548-5.118m-1.78-1.78A14.99 14.99 0 012.458 12C3.732 7.943 7.523 5 12 5c1.532 0 3 .263 4.373.75m3.627 3.627a10.05 10.05 0 012.542 2.623c-1.274 4.057-5.064 7-9.543 7a10.03 10.03 0 01-2.132-.25" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l22 22" />
  </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m1-12a1 1 0 011 1v2a1 1 0 01-2 0V6a1 1 0 011-1zm5 4a1 1 0 011 1v2a1 1 0 01-2 0V10a1 1 0 011-1zm5 4a1 1 0 011 1v2a1 1 0 01-2 0v-2a1 1 0 011-1zm-3-8a1 1 0 011 1v2a1 1 0 01-2 0V6a1 1 0 011-1z" />
    </svg>
);
