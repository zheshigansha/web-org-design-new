'use client';

interface ReportFrequencySelectorProps {
  value: 'daily' | 'manual';
  onChange: (frequency: 'daily' | 'manual') => void;
}

const options: { value: 'daily' | 'manual'; label: string; description: string }[] = [
  { value: 'daily', label: '定时每日一次', description: '每天自动生成一次报告' },
  { value: 'manual', label: '手动触发', description: '手动点击按钮生成报告' },
];

export function ReportFrequencySelector({ value, onChange }: ReportFrequencySelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        报告生成频率
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all
              ${value === option.value
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <span>{option.label}</span>
            <span className={`text-xs ${value === option.value ? 'text-blue-100' : 'text-gray-400'}`}>
              {option.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
