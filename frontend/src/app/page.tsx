'use client';

import { useEffect, useState } from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Eye, 
  Activity,
  Users,
  Percent,
  TrendingDown
} from 'lucide-react';
import { api, Statistics, District, StateSummary } from '@/lib/api';
import { getDisplayError } from '@/lib/errorHandling';
import { StatCard, RiskBadge, LoadingSpinner, ErrorMessage, ProgressBar } from '@/components/ui';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#16a34a', '#f59e0b', '#dc2626'];

export default function DashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [states, setStates] = useState<StateSummary[]>([]);
  const [highRiskDistricts, setHighRiskDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, statesData, districtsData] = await Promise.all([
          api.getStatistics(),
          api.getStates(),
          api.getDistricts({ risk: 'Watchlist', limit: 10 })
        ]);
        setStats(statsData);
        setStates(statesData);
        setHighRiskDistricts(districtsData.data);
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
  if (!stats) return null;

  const riskDistribution = [
    { name: 'Stable', value: stats.stable_districts, color: '#16a34a' },
    { name: 'Watchlist', value: stats.watchlist_districts, color: '#f59e0b' },
    { name: 'High Risk', value: stats.high_risk_districts, color: '#dc2626' },
  ];

  const topStates = states
    .sort((a, b) => a.avg_uls_score - b.avg_uls_score)
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ALIS Dashboard</h1>
        <p className="text-gray-600 mt-1">National Aadhaar Lifecycle Intelligence Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Districts"
          value={stats.total_districts}
          subtitle="Monitored nationwide"
          icon={MapPin}
          color="blue"
        />
        <StatCard
          title="Stable Districts"
          value={stats.stable_districts}
          subtitle={`${((stats.stable_districts / stats.total_districts) * 100).toFixed(1)}% of total`}
          icon={ShieldCheck}
          color="green"
        />
        <StatCard
          title="Watchlist Districts"
          value={stats.watchlist_districts}
          subtitle="Require monitoring"
          icon={Eye}
          color="yellow"
        />
        <StatCard
          title="High Risk Districts"
          value={stats.high_risk_districts}
          subtitle="Immediate attention needed"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Average ULS Score"
          value={stats.avg_uls_score.toFixed(1)}
          subtitle="Universal Lifecycle Score"
          icon={Activity}
          color="purple"
          animate={false}
        />
        <StatCard
          title="Total States/UTs"
          value={stats.total_states}
          subtitle="Coverage area"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Auth Failure Risk"
          value={`${stats.avg_auth_failure_prob.toFixed(1)}%`}
          subtitle="Average probability"
          icon={Percent}
          color="red"
          animate={false}
        />
        <StatCard
          title="ML High Risk"
          value={stats.ml_predictions.high_risk}
          subtitle="Predicted failures"
          icon={TrendingDown}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">States Requiring Attention</h2>
          <p className="text-sm text-gray-500 mb-4">Sorted by lowest ULS score</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topStates} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="state" type="category" width={120} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar 
                dataKey="avg_uls_score" 
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Watchlist Districts</h2>
        <p className="text-sm text-gray-500 mb-4">Districts requiring close monitoring</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ULS Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auth Failure %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {highRiskDistricts.map((district, index) => (
                <tr key={`${district.district_id}-${index}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                    {district.district_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {district.state}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="w-24">
                      <ProgressBar 
                        value={district.uls_score} 
                        color={district.uls_score >= 70 ? 'green' : district.uls_score >= 50 ? 'yellow' : 'red'}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RiskBadge risk={district.risk_classification} size="sm" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {district.auth_failure_probability?.toFixed(2)}%
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
