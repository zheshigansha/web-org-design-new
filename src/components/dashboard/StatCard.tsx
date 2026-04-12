'use client';

import { Card } from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  highlight?: boolean;
}

export function StatCard({ title, value, subtitle, highlight }: StatCardProps) {
  return (
    <Card className={`p-4 ${highlight ? 'bg-blue-600' : 'bg-white'}`}>
      <p className={`text-xs ${highlight ? 'text-blue-100' : 'text-gray-500'}`}>
        {title}
      </p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
      {subtitle && (
        <p className={`text-xs mt-1 ${highlight ? 'text-blue-200' : 'text-gray-400'}`}>
          {subtitle}
        </p>
      )}
    </Card>
  );
}
