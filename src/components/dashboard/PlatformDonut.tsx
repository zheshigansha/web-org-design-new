'use client';

import { Card } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PlatformDonutProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

export function PlatformDonut({ data }: PlatformDonutProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-4">平台占比</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height={192}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: 12,
              }}
              formatter={(value: unknown) => [`${value} 条`, '内容量']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-600">{item.name}</span>
            <span className="text-xs font-medium text-gray-900">
              ({total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
