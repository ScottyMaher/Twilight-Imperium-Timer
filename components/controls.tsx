// components/Controls.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowBigLeft, ArrowBigRight } from 'lucide-react';

interface ControlsProps {
  onPrevTurn: () => void;
  onEndTurn: () => void;
  onBack: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  onPrevTurn,
  onEndTurn,
  onBack,
}) => {
  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-x-4 justify-center mb-6">
      <Button variant="ghost" onClick={onBack} className="md:absolute md:top-6 md:left-6">
        <ArrowLeft />
        Back
      </Button>
      <Button variant="outline" onClick={onPrevTurn}>
        <ArrowBigLeft absoluteStrokeWidth />
        Prev Turn
      </Button>
      <Button onClick={onEndTurn}>
        End Turn
        <ArrowBigRight absoluteStrokeWidth />
      </Button>
    </div>
  );
};

export default Controls;
