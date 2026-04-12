'use client';

import type { HeatMetric } from '@/lib/db/schema';

interface HeatMetricSelectorProps {
  value: HeatMetric;
  onChange: (metric: HeatMetric) => void;
}

const metrics: { value: HeatMetric; label: string; icon: string }[] = [
  { value: 'composite', label: '综合评分', icon: '📊' },
  { value: 'likes', label: '点赞数', icon: '👍' },
  { value: 'reads', label: '阅读量', icon: '👁' },
  { value: 'interactions', label: '互动率', icon: '💬' },
];

export function HeatMetricSelector({ value, onChange }: HeatMetricSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        热度评判标准
      </label>
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => (
          <button
            key={metric.value}
            onClick={() => onChange(metric.value)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all
              ${value === metric.value
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <span>{metric.icon}</span>
            <span>{metric.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
