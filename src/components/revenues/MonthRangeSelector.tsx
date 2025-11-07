import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MONTH_PRESETS, MONTHS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MonthRangeSelectorProps {
  startMonth: number;
  endMonth: number;
  onRangeChange: (startMonth: number, endMonth: number) => void;
}

export const MonthRangeSelector = ({
  startMonth,
  endMonth,
  onRangeChange,
}: MonthRangeSelectorProps) => {
  const [activePreset, setActivePreset] = useState<string | null>(() => {
    // Detectar preset inicial
    const preset = Object.entries(MONTH_PRESETS).find(
      ([_, p]) => p.startMonth === startMonth && p.endMonth === endMonth
    );
    return preset ? preset[0] : null;
  });

  // Actualizar activePreset cuando cambien startMonth/endMonth externamente
  useEffect(() => {
    const preset = Object.entries(MONTH_PRESETS).find(
      ([_, p]) => p.startMonth === startMonth && p.endMonth === endMonth
    );
    setActivePreset(preset ? preset[0] : null);
  }, [startMonth, endMonth]);

  const handlePresetClick = (presetKey: string) => {
    const preset = MONTH_PRESETS[presetKey as keyof typeof MONTH_PRESETS];
    onRangeChange(preset.startMonth, preset.endMonth);
  };

  const handleManualChange = (type: 'start' | 'end', value: number) => {
    if (type === 'start') {
      onRangeChange(value, Math.max(value, endMonth));
    } else {
      onRangeChange(startMonth, Math.max(startMonth, value));
    }
  };

  return (
    <div className="space-y-3">
      {/* Presets */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">
          Período rápido
        </Label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(MONTH_PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              variant={activePreset === key ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(key)}
              className={cn(
                "h-8 px-3 text-xs",
                activePreset === key && "bg-primary text-primary-foreground"
              )}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Selectores manuales */}
      <div className="flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <Label className="text-xs text-muted-foreground">Desde</Label>
          <Select
            value={startMonth.toString()}
            onValueChange={(v) => handleManualChange('start', Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-2">
          <Label className="text-xs text-muted-foreground">Hasta</Label>
          <Select
            value={endMonth.toString()}
            onValueChange={(v) => handleManualChange('end', Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem 
                  key={m.value} 
                  value={m.value.toString()}
                  disabled={m.value < startMonth}
                >
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
