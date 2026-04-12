'use client';

interface PlatformToggleProps {
  value: 'xiaohongshu' | 'wechat' | null;
  onChange: (platform: 'xiaohongshu' | 'wechat' | null) => void;
}

export function PlatformToggle({ value, onChange }: PlatformToggleProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange(value === 'xiaohongshu' ? null : 'xiaohongshu')}
        className={`
          flex-1 py-3 px-4 rounded-lg font-medium text-center transition-all
          ${value === 'xiaohongshu'
            ? 'bg-red-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        `}
      >
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          小红书
        </span>
      </button>

      <button
        onClick={() => onChange(value === 'wechat' ? null : 'wechat')}
        className={`
          flex-1 py-3 px-4 rounded-lg font-medium text-center transition-all
          ${value === 'wechat'
            ? 'bg-green-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        `}
      >
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.5 11c-.83 0-1.5-.67-1.5-1.5S7.67 8 8.5 8s1.5.67 1.5 1.5S9.33 11 8.5 11zm5 0c-.83 0-1.5-.67-1.5-1.5S12.67 8 13.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-5.5 5.5c2.5 0 4.5-1.5 5.5-3.5 0-1-.5-2-1.5-2.5 1-.5 1.5-1.5 1.5-2.5 0-2-1.5-3.5-3.5-3.5-1.5 0-2.5.5-3.5 1.5-.5-.5-1-.5-1.5-.5-2.5 0-4.5 1.5-4.5 3.5 0 1 .5 2 1.5 2.5-1 .5-1.5 1.5-1.5 2.5 0 2 1.5 3.5 3.5 3.5 1 0 1.5-.5 2-.5s1 .5 1 1c0 2-1.5 3.5-3.5 3.5-1 0-2-.5-2.5-1 0 1 .5 2 2 2h6c2 0 3-1.5 3-3 0-1.5-1-2.5-2-2.5z"/>
          </svg>
          公众号
        </span>
      </button>
    </div>
  );
}
