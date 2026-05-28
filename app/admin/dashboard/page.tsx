'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface StatsData {
  kpis: {
    totalWorkers: number;
    totalAssessors: number;
    pendingAssessors: number;
    approvedAssessors: number;
    totalEmployers: number;
    totalTokens: number;
  };
  mintsChart: { date: string; count: number }[];
  tokensByTrade: { trade: string; count: number }[];
  tokensByStatus: { status: string; count: number }[];
  pendingAssessors: {
    id: string;
    name: string;
    itiName: string;
    itiCode: string;
    district: string;
    state: string;
    createdAt: string;
  }[];
}

const PIE_COLORS = ['#00BFA5', '#EF5350', '#FFB300'];

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to load stats');
        return;
      }
      setData(json.data);
    } catch {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAssessorAction = async (id: string, action: 'approve' | 'reject') => {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/assessors/${id}/approve?action=${action}`, {
        method: 'POST',
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? 'Action failed');
        return;
      }
      toast.success(action === 'approve' ? 'Assessor approved' : 'Assessor rejected');
      load();
    } catch {
      toast.error('Action failed');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="text-center text-text-secondary">
        <p>Unable to load platform statistics.</p>
        <Button className="mt-4" onClick={load}>
          Retry
        </Button>
      </Card>
    );
  }

  const mintsFormatted = data.mintsChart.map((d) => ({
    ...d,
    label: d.date.slice(5),
  }));

  const statusPie = data.tokensByStatus.map((s) => ({
    name: s.status,
    value: s.count,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-cream">Admin Dashboard</h1>
        <p className="mt-1 text-text-secondary">Platform overview and assessor approvals</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-text-secondary">Total Workers</p>
          <p className="mt-2 font-display text-3xl font-bold text-saffron">
            {data.kpis.totalWorkers}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Assessors</p>
          <p className="mt-2 font-display text-3xl font-bold text-cream">
            {data.kpis.approvedAssessors}
            <span className="text-lg text-text-muted"> / {data.kpis.totalAssessors}</span>
          </p>
          {data.kpis.pendingAssessors > 0 && (
            <Badge variant="amber" className="mt-2">
              {data.kpis.pendingAssessors} pending
            </Badge>
          )}
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Employers</p>
          <p className="mt-2 font-display text-3xl font-bold text-indigo">
            {data.kpis.totalEmployers}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">SBTs Minted</p>
          <p className="mt-2 font-display text-3xl font-bold text-teal">
            {data.kpis.totalTokens}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>SBTs Minted (Last 30 Days)</CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mintsFormatted}>
                <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#9E9690" fontSize={11} />
                <YAxis stroke="#9E9690" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#141414',
                    border: '1px solid #2A2A2A',
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#FF6B00"
                  strokeWidth={2}
                  dot={{ fill: '#FF6B00', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credentials by Trade</CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.tokensByTrade}>
                <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" />
                <XAxis
                  dataKey="trade"
                  stroke="#9E9690"
                  fontSize={10}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#9E9690" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#141414',
                    border: '1px solid #2A2A2A',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="count" fill="#00BFA5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Credential Status</CardTitle>
        </CardHeader>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusPie}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusPie.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip
                contentStyle={{
                  background: '#141414',
                  border: '1px solid #2A2A2A',
                  borderRadius: 8,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assessor Approvals</CardTitle>
        </CardHeader>
        {data.pendingAssessors.length === 0 ? (
          <p className="text-sm text-text-secondary">No pending assessor registrations.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">ITI</th>
                  <th className="pb-3 pr-4 font-medium">Code</th>
                  <th className="pb-3 pr-4 font-medium">District</th>
                  <th className="pb-3 pr-4 font-medium">State</th>
                  <th className="pb-3 pr-4 font-medium">Registered</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.pendingAssessors.map((a) => (
                  <tr key={a.id} className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-cream">{a.name}</td>
                    <td className="py-3 pr-4 text-text-secondary">{a.itiName}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-text-secondary">
                      {a.itiCode}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">{a.district}</td>
                    <td className="py-3 pr-4 text-text-secondary">{a.state}</td>
                    <td className="py-3 pr-4 text-text-muted">{formatDate(a.createdAt)}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          loading={actionId === a.id}
                          onClick={() => handleAssessorAction(a.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={actionId === a.id}
                          onClick={() => handleAssessorAction(a.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
