// components/Controls.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pause, Play, ArrowBigRight } from 'lucide-react';

interface ControlsProps {
  onEndTurn: () => void;
  onPause: () => void;
  onResume: () => void;
  onBack: () => void;
  isPaused: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  onEndTurn,
  onPause,
  onResume,
  onBack,
  isPaused,
}) => {
  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-x-4 justify-center mb-6">
      <Button variant="ghost" onClick={onBack} className="md:absolute md:top-6 md:left-6">
        <ArrowLeft />
        Back
      </Button>
      {!isPaused ? (
        <Button variant="outline" onClick={onPause}>
          Pause
          <Pause fill='white' strokeWidth={0} />
        </Button>
      ) : (
        <Button variant="outline" onClick={onResume}>
          Resume
          <Play fill='white' strokeWidth={0} />
        </Button>
      )}
      <Button onClick={onEndTurn}>
        End Turn
        <ArrowBigRight absoluteStrokeWidth />
      </Button>
    </div>
  );
};

export default Controls;
