'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PlatformToggle } from '@/components/content/PlatformToggle';
import type { MonitoredAccount } from '@/lib/db/schema';

interface AccountManagerProps {
  categoryId: string;
}

export function AccountManager({ categoryId }: AccountManagerProps) {
  const [accounts, setAccounts] = useState<MonitoredAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<'xiaohongshu' | 'wechat'>('xiaohongshu');
  const [accountId, setAccountId] = useState('');
  const [accountName, setAccountName] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/accounts?categoryId=${categoryId}`);
      const data = await res.json();
      setAccounts(data.accounts || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [categoryId]);

  const handleAdd = async () => {
    if (!accountId.trim() || !accountName.trim()) return;

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, platform, accountId: accountId.trim(), accountName: accountName.trim() }),
      });

      if (res.ok) {
        setAccountId('');
        setAccountName('');
        fetchAccounts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' });
      fetchAccounts();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAccounts = accounts.filter((a) => a.platform === platform);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        监控账号
      </label>

      <div className="mb-4">
        <PlatformToggle value={platform} onChange={(p) => p && setPlatform(p)} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <input
          type="text"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          placeholder="账号ID"
          className="col-span-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="账号名称"
          className="col-span-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={handleAdd} disabled={!accountId.trim() || !accountName.trim()}>
          添加
        </Button>
      </div>

      {loading ? (
        <div className="flex gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-6 w-24 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : filteredAccounts.length === 0 ? (
        <p className="text-sm text-gray-400">暂无监控账号</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filteredAccounts.map((acc) => (
            <Badge key={acc.id} variant="info" className="pr-1">
              {acc.account_name}
              <button
                onClick={() => handleDelete(acc.id)}
                className="ml-1 text-blue-400 hover:text-blue-600"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
