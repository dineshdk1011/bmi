
import React, { useRef } from 'react';

interface FileUploadProps {
  onFileLoad: (file: File) => void;
  disabled: boolean;
}

export default function FileUpload({ onFileLoad, disabled }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileLoad(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".ifc"
        disabled={disabled}
      />
      <button
        onClick={handleClick}
        disabled={disabled}
        className="bg-highlight text-white font-bold py-2 px-4 rounded hover:bg-teal-600 transition-colors duration-200 disabled:bg-accent disabled:cursor-not-allowed"
      >
        {disabled ? 'Loading...' : 'Load IFC File'}
      </button>
    </div>
  );
}
