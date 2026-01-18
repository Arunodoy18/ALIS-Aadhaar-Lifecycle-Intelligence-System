import pandas as pd
import numpy as np
from datetime import datetime
import json
import warnings
warnings.filterwarnings('ignore')

class LifecycleAnalytics:
    def __init__(self, data_path="datasets/"):
        self.data_path = data_path
        self.enrolment_df = None
        self.demographic_df = None
        self.biometric_df = None
        self.district_master = None
        self.uls_results = None
        
    def load_data(self):
        self.enrolment_df = pd.read_csv(f"{self.data_path}aadhaar_enrolment_data.csv")
        self.demographic_df = pd.read_csv(f"{self.data_path}demographic_update_logs.csv")
        self.biometric_df = pd.read_csv(f"{self.data_path}biometric_update_records.csv")
        self.district_master = pd.read_csv(f"{self.data_path}district_master.csv")
        print(f"Loaded data for {len(self.enrolment_df)} districts")
        
    def compute_coverage_ratio(self):
        coverage = self.enrolment_df[['district_id', 'district_name', 'state', 'coverage_ratio']].copy()
        coverage['coverage_score'] = coverage['coverage_ratio'] * 100
        return coverage
    
    def compute_demographic_frequency(self):
        latest_demo = self.demographic_df[self.demographic_df['year'] == self.demographic_df['year'].max()].copy()
        demo_freq = latest_demo[['district_id', 'total_demographic_updates', 'churn_rate', 'update_spike_detected']].copy()
        demo_freq['demographic_volatility'] = demo_freq['churn_rate'] * 100
        demo_freq['spike_flag'] = demo_freq['update_spike_detected'].astype(int)
        return demo_freq
    
    def compute_biometric_freshness(self):
        latest_bio = self.biometric_df[self.biometric_df['year'] == self.biometric_df['year'].max()].copy()
        bio_fresh = latest_bio[['district_id', 'avg_biometric_age_days', 'biometric_freshness_score', 
                                 'biometric_failure_rate', 'child_refresh_gap_months', 'anomaly_detected']].copy()
        
        bio_fresh['biometric_age_score'] = 100 - (bio_fresh['avg_biometric_age_days'] / 25)
        bio_fresh['biometric_age_score'] = bio_fresh['biometric_age_score'].clip(0, 100)
        
        bio_fresh['child_vulnerability_score'] = (bio_fresh['child_refresh_gap_months'] / 60) * 100
        bio_fresh['child_vulnerability_score'] = bio_fresh['child_vulnerability_score'].clip(0, 100)
        
        bio_fresh['anomaly_score'] = bio_fresh['anomaly_detected'].astype(int) * 50
        
        return bio_fresh
    
    def detect_anomalies(self):
        demo_by_district = self.demographic_df.groupby('district_id').agg({
            'total_demographic_updates': ['mean', 'std'],
            'update_spike_detected': 'sum'
        }).reset_index()
        demo_by_district.columns = ['district_id', 'update_mean', 'update_std', 'spike_count']
        
        demo_by_district['update_cv'] = demo_by_district['update_std'] / demo_by_district['update_mean']
        demo_by_district['anomaly_score'] = (demo_by_district['update_cv'] * 50 + 
                                              demo_by_district['spike_count'] * 10)
        demo_by_district['anomaly_score'] = demo_by_district['anomaly_score'].clip(0, 100)
        
        return demo_by_district[['district_id', 'anomaly_score', 'spike_count']]
    
    def compute_universal_lifecycle_score(self):
        coverage = self.compute_coverage_ratio()
        demo_freq = self.compute_demographic_frequency()
        bio_fresh = self.compute_biometric_freshness()
        anomaly = self.detect_anomalies()
        
        uls = coverage.merge(demo_freq, on='district_id', how='left')
        uls = uls.merge(bio_fresh, on='district_id', how='left')
        uls = uls.merge(anomaly, on='district_id', how='left', suffixes=('', '_anomaly'))
        
        uls['uls_score'] = (
            uls['coverage_score'] * 0.30 +
            (100 - uls['demographic_volatility']) * 0.15 +
            uls['biometric_age_score'] * 0.25 +
            (100 - uls['child_vulnerability_score']) * 0.15 +
            (100 - uls['anomaly_score']) * 0.15
        )
        
        uls['uls_score'] = uls['uls_score'].clip(0, 100).round(2)
        
        def classify_risk(score):
            if score >= 70:
                return 'Stable'
            elif score >= 50:
                return 'Watchlist'
            else:
                return 'High Risk'
        
        uls['risk_classification'] = uls['uls_score'].apply(classify_risk)
        
        uls['auth_failure_probability'] = ((100 - uls['uls_score']) / 100 * 
                                            uls['biometric_failure_rate'] * 100).round(2)
        uls['auth_failure_probability'] = uls['auth_failure_probability'].clip(0, 100)
        
        self.uls_results = uls
        return uls
    
    def generate_recommendations(self, uls_df):
        recommendations = []
        
        for _, row in uls_df.iterrows():
            district_recs = {
                'district_id': row['district_id'],
                'district_name': row['district_name'],
                'state': row['state'],
                'uls_score': row['uls_score'],
                'risk_classification': row['risk_classification'],
                'recommendations': []
            }
            
            if row['biometric_age_score'] < 50:
                district_recs['recommendations'].append({
                    'type': 'BIOMETRIC_CAMP',
                    'priority': 'HIGH',
                    'action': 'Organize district-level biometric update camps',
                    'reason': f"High biometric ageing detected (avg age: {row['avg_biometric_age_days']:.0f} days)"
                })
            
            if row['demographic_volatility'] > 20:
                district_recs['recommendations'].append({
                    'type': 'AWARENESS_DRIVE',
                    'priority': 'MEDIUM',
                    'action': 'Launch demographic data correction awareness campaign',
                    'reason': f"High demographic churn rate ({row['demographic_volatility']:.1f}%)"
                })
            
            if row['child_vulnerability_score'] > 60:
                district_recs['recommendations'].append({
                    'type': 'SCHOOL_INITIATIVE',
                    'priority': 'HIGH',
                    'action': 'Initiate school-based Aadhaar update program for children',
                    'reason': f"Child biometric refresh gap: {row['child_refresh_gap_months']:.0f} months"
                })
            
            if row['spike_flag'] == 1 or row['anomaly_score'] > 50:
                district_recs['recommendations'].append({
                    'type': 'FRAUD_AUDIT',
                    'priority': 'CRITICAL',
                    'action': 'Flag for fraud investigation and detailed audit',
                    'reason': 'Abnormal update spike or anomaly pattern detected'
                })
            
            if row['coverage_score'] < 85:
                district_recs['recommendations'].append({
                    'type': 'ENROLMENT_DRIVE',
                    'priority': 'MEDIUM',
                    'action': 'Conduct special enrolment drive in low-coverage areas',
                    'reason': f"Coverage ratio below target ({row['coverage_score']:.1f}%)"
                })
            
            if not district_recs['recommendations']:
                district_recs['recommendations'].append({
                    'type': 'MONITORING',
                    'priority': 'LOW',
                    'action': 'Continue regular monitoring',
                    'reason': 'District lifecycle health is stable'
                })
            
            recommendations.append(district_recs)
        
        return recommendations
    
    def get_trend_data(self):
        yearly_stats = self.biometric_df.groupby('year').agg({
            'biometric_failure_rate': 'mean',
            'authentication_success_rate': 'mean',
            'total_biometric_updates': 'sum',
            'child_biometric_updates': 'sum'
        }).reset_index()
        
        demo_yearly = self.demographic_df.groupby('year').agg({
            'total_demographic_updates': 'sum',
            'churn_rate': 'mean'
        }).reset_index()
        
        trends = yearly_stats.merge(demo_yearly, on='year')
        trends.columns = ['year', 'avg_failure_rate', 'avg_success_rate', 
                         'total_bio_updates', 'child_bio_updates',
                         'total_demo_updates', 'avg_churn_rate']
        
        return trends.to_dict(orient='records')
    
    def get_state_summary(self):
        if self.uls_results is None:
            self.compute_universal_lifecycle_score()
            
        state_summary = self.uls_results.groupby('state').agg({
            'uls_score': 'mean',
            'auth_failure_probability': 'mean',
            'district_id': 'count',
            'coverage_score': 'mean',
            'biometric_age_score': 'mean'
        }).reset_index()
        
        state_summary.columns = ['state', 'avg_uls_score', 'avg_auth_failure_prob', 
                                 'district_count', 'avg_coverage', 'avg_bio_freshness']
        
        state_summary['risk_level'] = state_summary['avg_uls_score'].apply(
            lambda x: 'Low' if x >= 70 else ('Medium' if x >= 50 else 'High')
        )
        
        return state_summary.round(2).to_dict(orient='records')
    
    def export_results(self, output_path="backend/analytics/"):
        if self.uls_results is None:
            self.compute_universal_lifecycle_score()
        
        self.uls_results.to_csv(f"{output_path}uls_scores.csv", index=False)
        
        recommendations = self.generate_recommendations(self.uls_results)
        with open(f"{output_path}recommendations.json", 'w') as f:
            json.dump(recommendations, f, indent=2)
        
        trends = self.get_trend_data()
        with open(f"{output_path}trends.json", 'w') as f:
            json.dump(trends, f, indent=2)
        
        state_summary = self.get_state_summary()
        with open(f"{output_path}state_summary.json", 'w') as f:
            json.dump(state_summary, f, indent=2)
        
        high_risk = self.uls_results[self.uls_results['risk_classification'] == 'High Risk']
        high_risk_list = high_risk[['district_id', 'district_name', 'state', 'uls_score', 
                                     'auth_failure_probability']].to_dict(orient='records')
        with open(f"{output_path}high_risk_districts.json", 'w') as f:
            json.dump(high_risk_list, f, indent=2)
        
        summary = {
            'total_districts': len(self.uls_results),
            'stable_count': len(self.uls_results[self.uls_results['risk_classification'] == 'Stable']),
            'watchlist_count': len(self.uls_results[self.uls_results['risk_classification'] == 'Watchlist']),
            'high_risk_count': len(self.uls_results[self.uls_results['risk_classification'] == 'High Risk']),
            'avg_uls_score': round(self.uls_results['uls_score'].mean(), 2),
            'avg_auth_failure_prob': round(self.uls_results['auth_failure_probability'].mean(), 2),
            'generated_at': datetime.now().isoformat()
        }
        with open(f"{output_path}summary.json", 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"Results exported to {output_path}")
        print(f"Summary: {summary}")
        
        return summary


if __name__ == "__main__":
    analytics = LifecycleAnalytics()
    analytics.load_data()
    
    uls = analytics.compute_universal_lifecycle_score()
    print("\nULS Score Distribution:")
    print(uls['risk_classification'].value_counts())
    
    summary = analytics.export_results()
