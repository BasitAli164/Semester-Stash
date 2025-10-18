'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface DateRangePickerProps {
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
}

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const [localRange, setLocalRange] = useState(dateRange);

  useEffect(() => {
    setLocalRange(dateRange);
  }, [dateRange]);

  const handleStartDateChange = (date: string) => {
    const newRange = { ...localRange, start: date };
    setLocalRange(newRange);
    onDateRangeChange(newRange);
  };

  const handleEndDateChange = (date: string) => {
    const newRange = { ...localRange, end: date };
    setLocalRange(newRange);
    onDateRangeChange(newRange);
  };

  const setQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    const newRange = {
      start: formatDate(start),
      end: formatDate(end)
    };
    
    setLocalRange(newRange);
    onDateRangeChange(newRange);
  };

  // Set max date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-3">
      {/* Quick Range Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setQuickRange(7)}
          className="text-xs"
        >
          Last 7 Days
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setQuickRange(30)}
          className="text-xs"
        >
          Last 30 Days
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setQuickRange(90)}
          className="text-xs"
        >
          Last 90 Days
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            const newRange = { start: today, end: today };
            setLocalRange(newRange);
            onDateRangeChange(newRange);
          }}
          className="text-xs"
        >
          Today
        </Button>
      </div>

      {/* Date Inputs */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <Input
            type="date"
            value={localRange.start}
            onChange={(e) => handleStartDateChange(e.target.value)}
            max={localRange.end || today}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center pt-5">
          <span className="text-gray-500 text-sm">to</span>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <Input
            type="date"
            value={localRange.end}
            onChange={(e) => handleEndDateChange(e.target.value)}
            min={localRange.start}
            max={today}
            className="w-full"
          />
        </div>
      </div>

      {/* Selected Range Display */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Selected: {localRange.start} to {localRange.end}
        </p>
      </div>
    </div>
  );
}