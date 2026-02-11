import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getAllTimerModes, TimerMode } from '@/lib/timerModes';

interface TimerConfigProps {
  selectedModeId: string;
  modeConfig: unknown;
  onModeChange: (modeId: string, config: unknown) => void;
  onNext: () => void;
}

const TimerConfig: React.FC<TimerConfigProps> = ({
  selectedModeId,
  modeConfig,
  onModeChange,
  onNext,
}) => {
  const modes = getAllTimerModes();

  const handleTabChange = (modeId: string) => {
    const mode = modes.find((m) => m.id === modeId);
    if (mode) {
      onModeChange(modeId, mode.defaultConfig);
    }
  };

  const selectedMode = modes.find((m) => m.id === selectedModeId) as TimerMode | undefined;

  return (
    <div className="w-full max-w-md space-y-6 bg-neutral-500/10 p-7 rounded shadow">
      <h1 className="text-2xl font-bold text-center">Timer Mode</h1>
      <Tabs value={selectedModeId} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="w-full h-auto bg-foreground/5 p-1">
          {modes.map((mode) => (
            <TabsTrigger
              key={mode.id}
              value={mode.id}
              className="flex-1 rounded-none border-b-2 border-transparent py-2.5 text-foreground/70 data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-secondary-foreground data-[state=active]:shadow-none"
            >
              {mode.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {modes.map((mode) => (
          <TabsContent key={mode.id} value={mode.id} className="space-y-6 pt-1">
            <p className="text-sm text-muted-foreground">{mode.description}</p>
            <mode.ConfigComponent
              config={modeConfig}
              onConfigChange={(newConfig: unknown) => onModeChange(mode.id, newConfig)}
            />
          </TabsContent>
        ))}
      </Tabs>
      {selectedMode && (
        <Button className="w-full" onClick={onNext}>
          Next
        </Button>
      )}
    </div>
  );
};

export default TimerConfig;
