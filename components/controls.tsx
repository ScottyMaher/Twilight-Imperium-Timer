// components/Controls.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowBigLeft, ArrowBigRight } from 'lucide-react';

interface ControlsProps {
  onPrevTurn: () => void;
  onEndTurn: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  onPrevTurn,
  onEndTurn,
}) => {
  return (
    <>
      <div className="mt-4 md:mb-6 w-full flex flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={onPrevTurn}
          className="h-24 md:h-auto w-2/5"
        >
          <ArrowBigLeft absoluteStrokeWidth />
          Prev Turn
        </Button>
        <Button
          onClick={onEndTurn}
          className="h-24 md:h-auto w-3/5"
        >
          End Turn
          <ArrowBigRight absoluteStrokeWidth />
        </Button>
      </div>
    </>
  );
};

export default Controls;
