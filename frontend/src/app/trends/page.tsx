'use client';

import { useEffect, useState } from 'react';
import { api, TrendData } from '@/lib/api';
import { LoadingSpinner, ErrorMessage } from '@/components/ui';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

export default function TrendsPage() {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getTrends();
        setTrends(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-8"><ErrorMessage message={error} /></div>;

  const formattedTrends = trends.map(t => ({
    ...t,
    avg_failure_rate: (t.avg_failure_rate * 100).toFixed(2),
    avg_success_rate: (t.avg_success_rate * 100).toFixed(2),
    avg_churn_rate: (t.avg_churn_rate * 100).toFixed(2),
    total_bio_updates_m: (t.total_bio_updates / 1000000).toFixed(2),
    total_demo_updates_m: (t.total_demo_updates / 1000000).toFixed(2),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lifecycle Trend Charts</h1>
        <p className="text-gray-600 mt-1">Year-over-year Aadhaar lifecycle analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Success Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="avg_success_rate" 
                name="Success Rate (%)"
                stroke="#16a34a" 
                fill="#86efac"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Failure Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 'auto']} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="avg_failure_rate" 
                name="Failure Rate (%)"
                stroke="#dc2626" 
                fill="#fca5a5"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Biometric Updates (Millions)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="total_bio_updates_m" 
                name="Total Updates (M)"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Demographic Updates (Millions)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="total_demo_updates_m" 
                name="Total Updates (M)"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Churn Rate Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis domain={[0, 'auto']} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="avg_churn_rate" 
              name="Avg Churn Rate (%)"
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Yearly Statistics</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failure Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bio Updates</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demo Updates</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Churn Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trends.map((trend) => (
                <tr key={trend.year} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{trend.year}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-green-600">
                    {(trend.avg_success_rate * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-red-600">
                    {(trend.avg_failure_rate * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {(trend.total_bio_updates / 1000000).toFixed(2)}M
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {(trend.total_demo_updates / 1000000).toFixed(2)}M
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-yellow-600">
                    {(trend.avg_churn_rate * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
