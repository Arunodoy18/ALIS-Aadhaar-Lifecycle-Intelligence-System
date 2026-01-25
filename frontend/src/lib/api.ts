import { fetchWithRetry } from './errorHandling';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetchWithRetry<ApiResponse<T> | T>(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  }, {
    maxAttempts: 3,
    delayMs: 1000,
    backoff: true
  });

  // Handle new wrapped response format
  if (response && typeof response === 'object' && 'success' in response) {
    if (response.success && response.data !== undefined) {
      return response.data as T;
    }
    if (!response.success && response.error) {
      throw new Error(response.error.message);
    }
  }

  // Handle legacy response format (direct data)
  return response as T;
}

export interface Statistics {
  total_districts: number;
  stable_districts: number;
  watchlist_districts: number;
  high_risk_districts: number;
  avg_uls_score: number;
  avg_auth_failure_prob: number;
  total_states: number;
  ml_predictions: {
    low_risk: number;
    medium_risk: number;
    high_risk: number;
    avg_failure_prob: number;
  };
  generated_at: string;
}

export interface District {
  district_id: string;
  district_name: string;
  state: string;
  coverage_ratio: number;
  coverage_score: number;
  uls_score: number;
  risk_classification: string;
  biometric_age_score: number;
  child_vulnerability_score: number;
  demographic_volatility: number;
  anomaly_score: number;
  auth_failure_probability: number;
  avg_biometric_age_days: number;
  child_refresh_gap_months: number;
}

export interface StateSummary {
  state: string;
  avg_uls_score: number;
  avg_auth_failure_prob: number;
  district_count: number;
  avg_coverage: number;
  avg_bio_freshness: number;
  risk_level: string;
}

export interface Recommendation {
  district_id: string;
  district_name: string;
  state: string;
  uls_score: number;
  risk_classification: string;
  recommendations: Array<{
    type: string;
    priority: string;
    action: string;
    reason: string;
  }>;
}

export interface TrendData {
  year: number;
  avg_failure_rate: number;
  avg_success_rate: number;
  total_bio_updates: number;
  child_bio_updates: number;
  total_demo_updates: number;
  avg_churn_rate: number;
}

export interface Prediction {
  district_id: string;
  predicted_auth_failure_prob: number;
  actual_auth_failure_prob: number;
  risk_category: string;
  district_name: string;
  state: string;
}

export interface ChildVulnerability {
  district_id: string;
  district_name: string;
  state: string;
  child_vulnerability_score: number;
  child_refresh_gap_months: number;
  uls_score: number;
}

export const api = {
  getStatistics: () => fetchApi<Statistics>('/api/statistics'),
  getDistricts: (params?: { state?: string; risk?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.state) query.set('state', params.state);
    if (params?.risk) query.set('risk', params.risk);
    if (params?.limit) query.set('limit', params.limit.toString());
    return fetchApi<{ total: number; data: District[] }>(`/api/districts?${query}`);
  },
  getDistrict: (id: string) => fetchApi<District & { recommendations: Recommendation['recommendations'] }>(`/api/districts/${id}`),
  getStates: () => fetchApi<StateSummary[]>('/api/states'),
  getRecommendations: (params?: { type?: string; priority?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.priority) query.set('priority', params.priority);
    return fetchApi<Recommendation[]>(`/api/recommendations?${query}`);
  },
  getTrends: () => fetchApi<TrendData[]>('/api/trends'),
  getHeatmap: () => fetchApi<Array<{ state: string; value: number; risk_level: string; district_count: number }>>('/api/heatmap'),
  getPredictions: (riskCategory?: string) => {
    const query = riskCategory ? `?risk_category=${riskCategory}` : '';
    return fetchApi<Prediction[]>(`/api/predictions${query}`);
  },
  getChildVulnerability: () => fetchApi<ChildVulnerability[]>('/api/child-vulnerability'),
  getHighRisk: () => fetchApi<{ lifecycle_high_risk: District[]; prediction_high_risk: Prediction[] }>('/api/high-risk'),
};
