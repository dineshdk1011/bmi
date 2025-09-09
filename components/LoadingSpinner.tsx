
import React from 'react';

interface LoadingSpinnerProps {
    message: string;
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="absolute inset-0 bg-primary bg-opacity-75 flex flex-col items-center justify-center z-30">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-highlight"></div>
      <p className="mt-4 text-text-primary text-lg">{message}</p>
    </div>
  );
}
