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
    <>
      <Button variant="ghost" onClick={onBack} className="absolute top-6 left-6">
        <ArrowLeft />
        Back <span className="ml-3">(end round)</span>
      </Button>

      <div className="mt-4 md:mb-6 w-full flex flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={onPrevTurn}
          className="h-24 md:h-auto w-1/3"
        >
          <ArrowBigLeft absoluteStrokeWidth />
          Prev Turn
        </Button>
        <Button
          onClick={onEndTurn}
          className="h-24 md:h-auto w-2/3"
        >
          End Turn
          <ArrowBigRight absoluteStrokeWidth />
        </Button>
      </div>
    </>
  );
};

export default Controls;
