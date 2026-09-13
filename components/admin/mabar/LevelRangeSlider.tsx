"use client";

import { LEVEL_OPTIONS, levelIndex } from "@/lib/constants";

export default function LevelRangeSlider({
  min,
  max,
  onChange,
}: {
  min: string;
  max: string;
  onChange: (min: string, max: string) => void;
}) {
  const minIdx = levelIndex(min);
  const maxIdx = levelIndex(max);

  const handleMinChange = (value: string) => {
    const newMinIdx = levelIndex(value);
    // Kalau min digeser lewatin max, ikut naikkan max juga
    const newMaxIdx = Math.max(newMinIdx, maxIdx);
    onChange(value, LEVEL_OPTIONS[newMaxIdx].value);
  };

  const handleMaxChange = (value: string) => {
    const newMaxIdx = levelIndex(value);
    // Kalau max digeser di bawah min, ikut turunkan min juga
    const newMinIdx = Math.min(minIdx, newMaxIdx);
    onChange(LEVEL_OPTIONS[newMinIdx].value, value);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink/60">
          Level Minimal
        </span>
        <select
          value={min}
          onChange={(e) => handleMinChange(e.target.value)}
          className="input"
        >
          {LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink/60">
          Level Maksimal
        </span>
        <select
          value={max}
          onChange={(e) => handleMaxChange(e.target.value)}
          className="input"
        >
          {LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
