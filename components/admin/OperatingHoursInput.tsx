'use client';

import { OperatingHours, DayOperatingHours } from '@/types/database';

type Props = {
  value: OperatingHours | null;
  onChange: (value: OperatingHours) => void;
};

const DEFAULT_DAY: DayOperatingHours = {
  isOpen: false,
  openTime: '09:00',
  closeTime: '18:00',
};

const DEFAULT_HOURS: OperatingHours = {
  monday: DEFAULT_DAY,
  tuesday: DEFAULT_DAY,
  wednesday: DEFAULT_DAY,
  thursday: DEFAULT_DAY,
  friday: DEFAULT_DAY,
  saturday: DEFAULT_DAY,
  sunday: DEFAULT_DAY,
};

const DAYS = [
  { key: 'sunday' as const, label: 'Sunday' },
  { key: 'monday' as const, label: 'Monday' },
  { key: 'tuesday' as const, label: 'Tuesday' },
  { key: 'wednesday' as const, label: 'Wednesday' },
  { key: 'thursday' as const, label: 'Thursday' },
  { key: 'friday' as const, label: 'Friday' },
  { key: 'saturday' as const, label: 'Saturday' },
];

export default function OperatingHoursInput({ value, onChange }: Props) {
  const hours = value || DEFAULT_HOURS;

  const updateDay = (
    day: keyof OperatingHours,
    field: keyof DayOperatingHours,
    newValue: boolean | string
  ) => {
    onChange({
      ...hours,
      [day]: {
        ...hours[day],
        [field]: newValue,
      },
    });
  };

  const inputClass = `px-3 py-2 bg-[#1a1a2e] border border-white/30 rounded-lg 
    text-soft-white placeholder-soft-white/50
    focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple/40
    transition-all text-sm`;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-soft-white/70 mb-3">
        Operating Hours
      </label>
      
      <div className="glass-card rounded-xl p-4 space-y-2">
        {DAYS.map(({ key, label }) => (
          <div
            key={key}
            className={`
              flex items-center gap-3 p-3 rounded-lg transition-all
              ${hours[key].isOpen ? 'bg-white/5' : 'bg-white/0'}
            `}
          >
            {/* Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer min-w-[120px]">
              <input
                type="checkbox"
                checked={hours[key].isOpen}
                onChange={(e) => updateDay(key, 'isOpen', e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-[#1a1a2e] 
                  text-cyber-purple focus:ring-2 focus:ring-cyber-purple/40
                  cursor-pointer"
              />
              <span className={`
                text-sm font-medium transition-colors
                ${hours[key].isOpen ? 'text-soft-white' : 'text-soft-white/40'}
              `}>
                {label}
              </span>
            </label>

            {/* Time Inputs */}
            <div className="flex items-center gap-2 flex-1">
              <input
                type="time"
                value={hours[key].openTime}
                onChange={(e) => updateDay(key, 'openTime', e.target.value)}
                disabled={!hours[key].isOpen}
                className={`${inputClass} ${!hours[key].isOpen ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
              <span className="text-soft-white/40 text-sm">to</span>
              <input
                type="time"
                value={hours[key].closeTime}
                onChange={(e) => updateDay(key, 'closeTime', e.target.value)}
                disabled={!hours[key].isOpen}
                className={`${inputClass} ${!hours[key].isOpen ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-soft-white/40 mt-2">
        Select which days the circuit is open and set the opening and closing times for each day.
      </p>
    </div>
  );
}

