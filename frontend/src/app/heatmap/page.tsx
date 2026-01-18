'use client';

import { useEffect, useState } from 'react';
import { api, StateSummary } from '@/lib/api';
import { LoadingSpinner, ErrorMessage, RiskBadge } from '@/components/ui';

export default function HeatmapPage() {
  const [states, setStates] = useState<StateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<StateSummary | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getStates();
        setStates(data);
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

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskBg = (score: number) => {
    if (score >= 70) return 'bg-green-100 hover:bg-green-200';
    if (score >= 50) return 'bg-yellow-100 hover:bg-yellow-200';
    return 'bg-red-100 hover:bg-red-200';
  };

  const sortedStates = [...states].sort((a, b) => b.avg_uls_score - a.avg_uls_score);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">India State Heatmap</h1>
        <p className="text-gray-600 mt-1">State-wise Universal Lifecycle Score distribution</p>
      </div>

      <div className="flex items-center justify-center gap-6 mb-8 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Stable (70+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm">Watchlist (50-69)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm">High Risk (&lt;50)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">State Grid View</h2>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {sortedStates.map((state) => (
                <button
                  key={state.state}
                  onClick={() => setSelectedState(state)}
                  className={`p-3 rounded-lg text-center transition-all ${getRiskBg(state.avg_uls_score)} ${
                    selectedState?.state === state.state ? 'ring-2 ring-blue-500' : ''
                  }`}
                  title={`${state.state}: ${state.avg_uls_score.toFixed(1)}`}
                >
                  <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${getRiskColor(state.avg_uls_score)}`}></div>
                  <span className="text-xs font-medium truncate block">
                    {state.state.length > 10 ? state.state.substring(0, 10) + '...' : state.state}
                  </span>
                  <span className="text-xs font-bold">{state.avg_uls_score.toFixed(0)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {selectedState ? (
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">{selectedState.state}</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Risk Level</p>
                  <RiskBadge risk={selectedState.risk_level} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average ULS Score</p>
                  <p className="text-3xl font-bold text-gray-900">{selectedState.avg_uls_score.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Districts</p>
                  <p className="text-2xl font-semibold">{selectedState.district_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Auth Failure Probability</p>
                  <p className="text-2xl font-semibold text-red-600">{selectedState.avg_auth_failure_prob.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Coverage</p>
                  <p className="text-2xl font-semibold text-blue-600">{selectedState.avg_coverage.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Biometric Freshness</p>
                  <p className="text-2xl font-semibold text-purple-600">{selectedState.avg_bio_freshness.toFixed(1)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
              <p>Click on a state to view details</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">State Rankings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ULS Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Districts</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auth Failure %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStates.map((state, index) => (
                <tr key={state.state} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{index + 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{state.state}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(state.avg_uls_score)}`}></div>
                      <span className="font-semibold">{state.avg_uls_score.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RiskBadge risk={state.risk_level} size="sm" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">{state.district_count}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">{state.avg_auth_failure_prob.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
