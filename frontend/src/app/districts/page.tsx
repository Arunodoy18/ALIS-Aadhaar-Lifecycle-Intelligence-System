'use client';

import { useEffect, useState } from 'react';
import { api, District, StateSummary } from '@/lib/api';
import { LoadingSpinner, ErrorMessage, RiskBadge, ProgressBar } from '@/components/ui';
import { Search, Filter } from 'lucide-react';

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [states, setStates] = useState<StateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [districtsData, statesData] = await Promise.all([
          api.getDistricts({ limit: 1000 }),
          api.getStates()
        ]);
        setDistricts(districtsData.data);
        setStates(statesData);
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

  const filteredDistricts = districts.filter((d) => {
    const matchesSearch = d.district_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = !selectedState || d.state === selectedState;
    const matchesRisk = !selectedRisk || d.risk_classification === selectedRisk;
    return matchesSearch && matchesState && matchesRisk;
  });

  const uniqueStates = [...new Set(districts.map(d => d.state))].sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">District Risk Rankings</h1>
        <p className="text-gray-600 mt-1">Comprehensive district-wise lifecycle analysis</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search district or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All States</option>
            {uniqueStates.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Risk Levels</option>
            <option value="Stable">Stable</option>
            <option value="Watchlist">Watchlist</option>
            <option value="High Risk">High Risk</option>
          </select>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredDistricts.length} of {districts.length} districts
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ULS Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coverage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bio Age Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auth Fail %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDistricts.map((district, index) => (
                <tr key={district.district_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{district.district_name}</span>
                    <span className="text-xs text-gray-500 block">{district.district_id}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {district.state}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="w-20">
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
                    {(district.coverage_score || district.coverage_ratio * 100)?.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`font-medium ${
                      district.biometric_age_score >= 70 ? 'text-green-600' :
                      district.biometric_age_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {district.biometric_age_score?.toFixed(1) || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`font-medium ${
                      district.auth_failure_probability < 5 ? 'text-green-600' :
                      district.auth_failure_probability < 15 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {district.auth_failure_probability?.toFixed(2)}%
                    </span>
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
