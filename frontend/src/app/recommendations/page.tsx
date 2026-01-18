'use client';

import { useEffect, useState } from 'react';
import { api, Recommendation } from '@/lib/api';
import { LoadingSpinner, ErrorMessage, RiskBadge, PriorityBadge } from '@/components/ui';
import { AlertTriangle, Filter, Fingerprint, Users, School, Shield, MapPin } from 'lucide-react';

const actionIcons: Record<string, typeof AlertTriangle> = {
  BIOMETRIC_CAMP: Fingerprint,
  AWARENESS_DRIVE: Users,
  SCHOOL_INITIATIVE: School,
  FRAUD_AUDIT: Shield,
  ENROLMENT_DRIVE: MapPin,
  MONITORING: AlertTriangle,
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getRecommendations();
        setRecommendations(data);
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

  const allTypes = [...new Set(recommendations.flatMap(r => r.recommendations.map(rec => rec.type)))];
  const allPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const filteredRecs = recommendations
    .map(district => ({
      ...district,
      recommendations: district.recommendations.filter(rec => {
        if (selectedType && rec.type !== selectedType) return false;
        if (selectedPriority && rec.priority !== selectedPriority) return false;
        return true;
      })
    }))
    .filter(d => d.recommendations.length > 0);

  const totalRecs = filteredRecs.reduce((sum, d) => sum + d.recommendations.length, 0);
  const criticalCount = recommendations.flatMap(r => r.recommendations).filter(r => r.priority === 'CRITICAL').length;
  const highCount = recommendations.flatMap(r => r.recommendations).filter(r => r.priority === 'HIGH').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">UIDAI Intervention Recommendations</h1>
        <p className="text-gray-600 mt-1">Policy actions mapped to district risk profiles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-md p-6 text-white">
          <p className="text-white/80 text-sm">Critical Actions</p>
          <p className="text-4xl font-bold mt-2">{criticalCount}</p>
          <p className="text-white/70 text-xs mt-1">Immediate attention</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-md p-6 text-white">
          <p className="text-white/80 text-sm">High Priority</p>
          <p className="text-4xl font-bold mt-2">{highCount}</p>
          <p className="text-white/70 text-xs mt-1">Urgent actions</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
          <p className="text-white/80 text-sm">Total Recommendations</p>
          <p className="text-4xl font-bold mt-2">{totalRecs}</p>
          <p className="text-white/70 text-xs mt-1">Filtered results</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
          <p className="text-white/80 text-sm">Districts Affected</p>
          <p className="text-4xl font-bold mt-2">{filteredRecs.length}</p>
          <p className="text-white/70 text-xs mt-1">With recommendations</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Filters:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {allTypes.map((type) => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            {allPriorities.map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
          {(selectedType || selectedPriority) && (
            <button
              onClick={() => { setSelectedType(''); setSelectedPriority(''); }}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {filteredRecs.map((district) => (
          <div key={district.district_id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{district.district_name}</h3>
                <p className="text-sm text-gray-500">{district.state}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">ULS Score</p>
                  <p className="text-xl font-bold">{district.uls_score.toFixed(1)}</p>
                </div>
                <RiskBadge risk={district.risk_classification} />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {district.recommendations.map((rec, idx) => {
                  const Icon = actionIcons[rec.type] || AlertTriangle;
                  return (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-lg ${
                        rec.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                        rec.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                        rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{rec.type.replace(/_/g, ' ')}</span>
                          <PriorityBadge priority={rec.priority} />
                        </div>
                        <p className="text-gray-700">{rec.action}</p>
                        <p className="text-sm text-gray-500 mt-1">{rec.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRecs.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No recommendations match your filters</p>
          <button
            onClick={() => { setSelectedType(''); setSelectedPriority(''); }}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
