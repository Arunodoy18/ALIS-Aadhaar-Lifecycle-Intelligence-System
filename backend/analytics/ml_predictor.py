import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, mean_squared_error, r2_score
import joblib
import json
import warnings
warnings.filterwarnings('ignore')

class AuthFailurePredictor:
    def __init__(self, data_path="datasets/"):
        self.data_path = data_path
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = []
        
    def prepare_features(self):
        enrolment = pd.read_csv(f"{self.data_path}aadhaar_enrolment_data.csv")
        demographic = pd.read_csv(f"{self.data_path}demographic_update_logs.csv")
        biometric = pd.read_csv(f"{self.data_path}biometric_update_records.csv")
        
        latest_demo = demographic[demographic['year'] == demographic['year'].max()]
        latest_bio = biometric[biometric['year'] == biometric['year'].max()]
        
        demo_agg = demographic.groupby('district_id').agg({
            'total_demographic_updates': ['mean', 'std', 'max'],
            'churn_rate': 'mean',
            'update_spike_detected': 'sum'
        }).reset_index()
        demo_agg.columns = ['district_id', 'demo_update_mean', 'demo_update_std', 
                           'demo_update_max', 'avg_churn_rate', 'total_spikes']
        
        bio_agg = biometric.groupby('district_id').agg({
            'avg_biometric_age_days': 'mean',
            'biometric_failure_rate': 'mean',
            'child_refresh_gap_months': 'mean',
            'anomaly_detected': 'sum'
        }).reset_index()
        bio_agg.columns = ['district_id', 'avg_bio_age', 'avg_failure_rate', 
                          'avg_child_gap', 'total_anomalies']
        
        features = enrolment[['district_id', 'coverage_ratio', 'rejection_rate', 
                              'child_enrolments', 'adult_enrolments']].copy()
        features['child_ratio'] = features['child_enrolments'] / (features['child_enrolments'] + features['adult_enrolments'])
        
        features = features.merge(demo_agg, on='district_id')
        features = features.merge(bio_agg, on='district_id')
        latest_bio_subset = latest_bio[['district_id', 'biometric_failure_rate']].copy()
        latest_bio_subset.columns = ['district_id', 'biometric_failure_rate_current']
        features = features.merge(latest_bio_subset, on='district_id')
        
        features['auth_failure_prob'] = features['biometric_failure_rate_current'] * 100
        
        features['demo_volatility'] = features['demo_update_std'] / features['demo_update_mean'].replace(0, 1)
        features['bio_age_normalized'] = features['avg_bio_age'] / 2500
        features['spike_rate'] = features['total_spikes'] / 6
        features['anomaly_rate'] = features['total_anomalies'] / 6
        
        return features
    
    def train_model(self, model_type='random_forest'):
        features = self.prepare_features()
        
        self.feature_columns = [
            'coverage_ratio', 'rejection_rate', 'child_ratio',
            'demo_update_mean', 'avg_churn_rate', 'total_spikes',
            'avg_bio_age', 'avg_failure_rate', 'avg_child_gap', 'total_anomalies',
            'demo_volatility', 'bio_age_normalized', 'spike_rate', 'anomaly_rate'
        ]
        
        X = features[self.feature_columns].fillna(0)
        y = features['auth_failure_prob']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        if model_type == 'random_forest':
            self.model = GradientBoostingRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            )
        else:
            self.model = GradientBoostingRegressor(
                n_estimators=50,
                max_depth=4,
                random_state=42
            )
        
        self.model.fit(X_train_scaled, y_train)
        
        y_pred = self.model.predict(X_test_scaled)
        
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        feature_importance = dict(zip(self.feature_columns, 
                                      self.model.feature_importances_.tolist()))
        
        metrics = {
            'mse': round(mse, 4),
            'rmse': round(np.sqrt(mse), 4),
            'r2_score': round(r2, 4),
            'model_type': model_type,
            'feature_importance': feature_importance
        }
        
        print(f"Model trained successfully!")
        print(f"RMSE: {metrics['rmse']}")
        print(f"R2 Score: {metrics['r2_score']}")
        
        return metrics
    
    def predict_all_districts(self):
        features = self.prepare_features()
        X = features[self.feature_columns].fillna(0)
        X_scaled = self.scaler.transform(X)
        
        predictions = self.model.predict(X_scaled)
        predictions = np.clip(predictions, 0, 100)
        
        results = features[['district_id']].copy()
        results['predicted_auth_failure_prob'] = predictions.round(2)
        results['actual_auth_failure_prob'] = features['auth_failure_prob'].round(2)
        
        def risk_category(prob):
            if prob < 5:
                return 'Low Risk'
            elif prob < 15:
                return 'Medium Risk'
            else:
                return 'High Risk'
        
        results['risk_category'] = results['predicted_auth_failure_prob'].apply(risk_category)
        
        return results
    
    def save_model(self, output_path="backend/analytics/"):
        joblib.dump(self.model, f"{output_path}auth_failure_model.joblib")
        joblib.dump(self.scaler, f"{output_path}feature_scaler.joblib")
        
        with open(f"{output_path}model_config.json", 'w') as f:
            json.dump({
                'feature_columns': self.feature_columns,
                'model_type': 'GradientBoostingRegressor'
            }, f, indent=2)
        
        print(f"Model saved to {output_path}")
    
    def load_model(self, model_path="backend/analytics/"):
        self.model = joblib.load(f"{model_path}auth_failure_model.joblib")
        self.scaler = joblib.load(f"{model_path}feature_scaler.joblib")
        
        with open(f"{model_path}model_config.json", 'r') as f:
            config = json.load(f)
            self.feature_columns = config['feature_columns']
        
        print("Model loaded successfully!")
    
    def export_predictions(self, output_path="backend/analytics/"):
        predictions = self.predict_all_districts()
        
        enrolment = pd.read_csv(f"{self.data_path}aadhaar_enrolment_data.csv")
        predictions = predictions.merge(
            enrolment[['district_id', 'district_name', 'state']], 
            on='district_id'
        )
        
        predictions.to_csv(f"{output_path}ml_predictions.csv", index=False)
        
        predictions_json = predictions.to_dict(orient='records')
        with open(f"{output_path}ml_predictions.json", 'w') as f:
            json.dump(predictions_json, f, indent=2)
        
        high_risk = predictions[predictions['risk_category'] == 'High Risk']
        high_risk_json = high_risk.to_dict(orient='records')
        with open(f"{output_path}high_risk_predictions.json", 'w') as f:
            json.dump(high_risk_json, f, indent=2)
        
        summary = {
            'total_districts': len(predictions),
            'low_risk_count': len(predictions[predictions['risk_category'] == 'Low Risk']),
            'medium_risk_count': len(predictions[predictions['risk_category'] == 'Medium Risk']),
            'high_risk_count': len(predictions[predictions['risk_category'] == 'High Risk']),
            'avg_predicted_failure_prob': round(predictions['predicted_auth_failure_prob'].mean(), 2),
            'max_predicted_failure_prob': round(predictions['predicted_auth_failure_prob'].max(), 2)
        }
        
        with open(f"{output_path}prediction_summary.json", 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"Predictions exported to {output_path}")
        print(f"Summary: {summary}")
        
        return summary


if __name__ == "__main__":
    predictor = AuthFailurePredictor()
    
    print("Training ML model...")
    metrics = predictor.train_model('random_forest')
    
    print("\nSaving model...")
    predictor.save_model()
    
    print("\nGenerating predictions...")
    summary = predictor.export_predictions()
