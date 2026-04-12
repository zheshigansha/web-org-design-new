'use client';

import { useState } from 'react';

interface DateTimelineProps {
  value: string;
  onChange: (date: string) => void;
}

export function DateTimeline({ value, onChange }: DateTimelineProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // 生成最近7天的日期
  const recentDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}`;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const weeks = ['日', '一', '二', '三', '四', '五', '六'];
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}-`;
    const todayStr = today.toISOString().split('T')[0];

    return (
      <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-medium">{year}年 {month + 1}月</span>
          <button
            onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weeks.map((w) => (
            <div key={w} className="text-center text-xs text-gray-400 py-1">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateStr = `${monthStr}${String(day).padStart(2, '0')}`;
            const isSelected = value === dateStr;
            const isToday = dateStr === todayStr;
            const isFuture = new Date(dateStr) > today;

            return (
              <button
                key={i}
                onClick={() => {
                  onChange(dateStr);
                  setShowCalendar(false);
                }}
                disabled={isFuture}
                className={`
                  w-8 h-8 text-sm rounded-lg
                  ${isSelected ? 'bg-blue-600 text-white' : ''}
                  ${isToday && !isSelected ? 'ring-2 ring-blue-400' : ''}
                  ${!isSelected && !isFuture ? 'hover:bg-gray-100' : ''}
                  ${isFuture ? 'text-gray-300 cursor-not-allowed' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
        {value && (
          <button
            onClick={() => {
              onChange('');
              setShowCalendar(false);
            }}
            className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700 py-1"
          >
            清除日期
          </button>
        )}
      </div>
    );
  };

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return (
    <div className="relative">
      <div className="flex gap-2">
        {recentDates.map((date) => {
          const d = new Date(date);
          const dayOfWeek = weekDays[d.getDay()];
          return (
            <button
              key={date}
              onClick={() => onChange(date)}
              className={`
                flex flex-col items-center px-4 py-2 rounded-lg transition-all min-w-[56px]
                ${value === date
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <span className="text-xs opacity-70">{dayOfWeek}</span>
              <span className="text-lg font-medium">{formatDate(date)}</span>
            </button>
          );
        })}
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className={`
            flex flex-col items-center px-4 py-2 rounded-lg transition-all min-w-[56px]
            ${!value || !recentDates.includes(value)
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          <span className="text-xs opacity-70">日历</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      {showCalendar && renderCalendar()}
    </div>
  );
}
