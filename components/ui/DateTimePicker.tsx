'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parse,
} from 'date-fns';

type DateTimePickerProps = {
  value: string; // datetime-local format: "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
};

export default function DateTimePicker({
  value,
  onChange,
  className = '',
  required = false,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'calendar' | 'time'>('calendar');
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse the datetime-local value
  const parseValue = (val: string): Date => {
    if (!val) return new Date();
    try {
      return parse(val, "yyyy-MM-dd'T'HH:mm", new Date());
    } catch {
      return new Date();
    }
  };

  const selectedDate = parseValue(value);
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [tempHours, setTempHours] = useState(selectedDate.getHours());
  const [tempMinutes, setTempMinutes] = useState(selectedDate.getMinutes());

  // Update temp values when value changes
  useEffect(() => {
    const date = parseValue(value);
    setTempHours(date.getHours());
    setTempMinutes(date.getMinutes());
    setCurrentMonth(date);
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatValue = (date: Date, hours: number, minutes: number): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    return `${year}-${month}-${day}T${h}:${m}`;
  };

  const handleDateSelect = (date: Date) => {
    const newValue = formatValue(date, tempHours, tempMinutes);
    onChange(newValue);
    setView('time');
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    setTempHours(hours);
    setTempMinutes(minutes);
    const newValue = formatValue(selectedDate, hours, minutes);
    onChange(newValue);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    setView('calendar');
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  };

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const calendarDays = generateCalendarDays();

  // Generate hours array (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // Generate minutes array (0, 15, 30, 45 for quick select, or all for fine control)
  const quickMinutes = [0, 15, 30, 45];

  const displayValue = value
    ? format(selectedDate, 'MMM d, yyyy • h:mm a')
    : 'Select date & time';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-[#1a1a2e] border border-white/30 rounded-xl 
          text-soft-white text-left flex items-center justify-between gap-3
          focus:outline-none focus:border-velocity-yellow focus:ring-2 focus:ring-velocity-yellow/40
          hover:border-white/50 transition-all ${!value ? 'text-soft-white/50' : ''}`}
      >
        <span className="flex items-center gap-3">
          <Calendar size={18} className="text-velocity-yellow" />
          {displayValue}
        </span>
        <Clock size={18} className="text-soft-white/40" />
      </button>

      {/* Hidden native input for form validation */}
      <input
        type="hidden"
        value={value}
        required={required}
      />

      {/* Picker Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 right-0 sm:left-auto sm:right-auto sm:w-[320px]
          bg-[#1a1a2e] border border-white/20 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden
          animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView('calendar')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  view === 'calendar'
                    ? 'bg-velocity-yellow text-black'
                    : 'text-soft-white/60 hover:text-soft-white hover:bg-white/5'
                }`}
              >
                <Calendar size={16} className="inline mr-1.5" />
                Date
              </button>
              <button
                type="button"
                onClick={() => setView('time')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  view === 'time'
                    ? 'bg-velocity-yellow text-black'
                    : 'text-soft-white/60 hover:text-soft-white hover:bg-white/5'
                }`}
              >
                <Clock size={16} className="inline mr-1.5" />
                Time
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-soft-white/40 hover:text-soft-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Calendar View */}
          {view === 'calendar' && (
            <div className="p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 text-soft-white/60 hover:text-soft-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="font-f1 font-bold text-soft-white">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 text-soft-white/60 hover:text-soft-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-soft-white/40 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      disabled={!isCurrentMonth}
                      className={`
                        p-2 text-sm font-medium rounded-lg transition-all
                        ${isSelected
                          ? 'bg-electric-red text-white'
                          : isTodayDate
                            ? 'bg-velocity-yellow/20 text-velocity-yellow border border-velocity-yellow/30'
                            : isCurrentMonth
                              ? 'text-soft-white hover:bg-white/10'
                              : 'text-soft-white/20 cursor-not-allowed'
                        }
                      `}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>

              {/* Quick Today Button */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setCurrentMonth(today);
                    handleDateSelect(today);
                  }}
                  className="w-full py-2 text-sm font-medium text-velocity-yellow hover:bg-velocity-yellow/10 rounded-lg transition-colors"
                >
                  Today
                </button>
              </div>
            </div>
          )}

          {/* Time View */}
          {view === 'time' && (
            <div className="p-4">
              <div className="text-center mb-4">
                <p className="text-soft-white/40 text-sm mb-1">Selected Date</p>
                <p className="font-f1 font-bold text-soft-white">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>

              {/* Current Time Display */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="bg-electric-red/20 border border-electric-red/40 rounded-xl px-6 py-3">
                  <span className="font-f1 text-3xl font-bold text-electric-red">
                    {String(tempHours).padStart(2, '0')}
                  </span>
                </div>
                <span className="font-f1 text-2xl font-bold text-soft-white/40">:</span>
                <div className="bg-electric-red/20 border border-electric-red/40 rounded-xl px-6 py-3">
                  <span className="font-f1 text-3xl font-bold text-electric-red">
                    {String(tempMinutes).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Hour Selection */}
              <div className="mb-4">
                <p className="text-xs font-medium text-soft-white/40 mb-2">Hour</p>
                <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => handleTimeChange(hour, tempMinutes)}
                      className={`
                        py-2 text-sm font-medium rounded-lg transition-all
                        ${tempHours === hour
                          ? 'bg-velocity-yellow text-black'
                          : 'text-soft-white/70 hover:bg-white/10 hover:text-soft-white'
                        }
                      `}
                    >
                      {String(hour).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minute Selection (Quick) */}
              <div className="mb-4">
                <p className="text-xs font-medium text-soft-white/40 mb-2">Minutes (quick)</p>
                <div className="grid grid-cols-4 gap-2">
                  {quickMinutes.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => handleTimeChange(tempHours, minute)}
                      className={`
                        py-2 text-sm font-medium rounded-lg transition-all
                        ${tempMinutes === minute
                          ? 'bg-velocity-yellow text-black'
                          : 'text-soft-white/70 hover:bg-white/10 hover:text-soft-white border border-white/10'
                        }
                      `}
                    >
                      :{String(minute).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine Minute Control */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => handleTimeChange(tempHours, Math.max(0, tempMinutes - 1))}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-soft-white transition-colors"
                >
                  -1
                </button>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={tempMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handleTimeChange(tempHours, Math.min(59, Math.max(0, val)));
                  }}
                  className="w-20 text-center px-3 py-2 bg-[#0d0d11] border border-white/20 rounded-lg 
                    text-soft-white font-mono focus:outline-none focus:border-velocity-yellow"
                />
                <button
                  type="button"
                  onClick={() => handleTimeChange(tempHours, Math.min(59, tempMinutes + 1))}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-soft-white transition-colors"
                >
                  +1
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-white/10 flex gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2.5 text-sm font-medium text-soft-white/60 
                hover:text-soft-white hover:bg-white/5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 text-sm font-medium bg-electric-red text-white 
                rounded-xl hover:bg-electric-red/90 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

