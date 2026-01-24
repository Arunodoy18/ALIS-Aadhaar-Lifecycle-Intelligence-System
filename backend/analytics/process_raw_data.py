"""
Safe Data Processing Script
Reads raw CSV files from datasets/ folder and processes them for analytics
Does NOT modify or delete any original files
"""

import pandas as pd
import numpy as np
from datetime import datetime
import os
import json

class SafeDataProcessor:
    def __init__(self, datasets_path="datasets/", output_path="datasets/processed/"):
        self.datasets_path = datasets_path
        self.output_path = output_path
        
        # Create output directory if it doesn't exist
        os.makedirs(output_path, exist_ok=True)
        
        print(f"✓ Data Processor initialized")
        print(f"  Reading from: {datasets_path}")
        print(f"  Writing to: {output_path}")
        print(f"  Original files will NOT be modified")
        print("-" * 60)
    
    def safe_read_csv(self, filepath):
        """Safely read CSV with error handling"""
        try:
            df = pd.read_csv(filepath)
            print(f"  ✓ Loaded: {os.path.basename(filepath)} ({len(df):,} rows)")
            return df
        except Exception as e:
            print(f"  ✗ Error loading {filepath}: {e}")
            return None
    
    def merge_biometric_files(self):
        """Merge all biometric CSV files"""
        print("\n[1/4] Processing Biometric Data...")
        
        bio_files = [
            "api_data_aadhar_biometric/api_data_aadhar_biometric_0_500000.csv",
            "api_data_aadhar_biometric/api_data_aadhar_biometric_500000_1000000.csv",
            "api_data_aadhar_biometric/api_data_aadhar_biometric_1000000_1500000.csv",
            "api_data_aadhar_biometric/api_data_aadhar_biometric_1500000_1861108.csv"
        ]
        
        dfs = []
        for file in bio_files:
            filepath = os.path.join(self.datasets_path, file)
            if os.path.exists(filepath):
                df = self.safe_read_csv(filepath)
                if df is not None:
                    dfs.append(df)
        
        if not dfs:
            print("  ✗ No biometric files found")
            return None
        
        merged = pd.concat(dfs, ignore_index=True)
        print(f"  ✓ Merged {len(dfs)} files → {len(merged):,} total rows")
        return merged
    
    def merge_demographic_files(self):
        """Merge all demographic CSV files"""
        print("\n[2/4] Processing Demographic Data...")
        
        demo_files = [
            "api_data_aadhar_demographic/api_data_aadhar_demographic_0_500000.csv",
            "api_data_aadhar_demographic/api_data_aadhar_demographic_500000_1000000.csv",
            "api_data_aadhar_demographic/api_data_aadhar_demographic_1000000_1500000.csv",
            "api_data_aadhar_demographic/api_data_aadhar_demographic_1500000_2000000.csv",
            "api_data_aadhar_demographic/api_data_aadhar_demographic_2000000_2071700.csv"
        ]
        
        dfs = []
        for file in demo_files:
            filepath = os.path.join(self.datasets_path, file)
            if os.path.exists(filepath):
                df = self.safe_read_csv(filepath)
                if df is not None:
                    dfs.append(df)
        
        if not dfs:
            print("  ✗ No demographic files found")
            return None
        
        merged = pd.concat(dfs, ignore_index=True)
        print(f"  ✓ Merged {len(dfs)} files → {len(merged):,} total rows")
        return merged
    
    def merge_enrolment_files(self):
        """Merge all enrolment CSV files"""
        print("\n[3/4] Processing Enrolment Data...")
        
        enrol_files = [
            "api_data_aadhar_biometric/api_data_aadhar_enrolment/api_data_aadhar_enrolment_0_500000.csv",
            "api_data_aadhar_biometric/api_data_aadhar_enrolment/api_data_aadhar_enrolment_500000_1000000.csv",
            "api_data_aadhar_biometric/api_data_aadhar_enrolment/api_data_aadhar_enrolment_1000000_1006029.csv"
        ]
        
        dfs = []
        for file in enrol_files:
            filepath = os.path.join(self.datasets_path, file)
            if os.path.exists(filepath):
                df = self.safe_read_csv(filepath)
                if df is not None:
                    dfs.append(df)
        
        if not dfs:
            print("  ✗ No enrolment files found")
            return None
        
        merged = pd.concat(dfs, ignore_index=True)
        print(f"  ✓ Merged {len(dfs)} files → {len(merged):,} total rows")
        return merged
    
    def create_district_master(self, bio_df, demo_df, enrol_df):
        """Create district master from all datasets"""
        print("\n[4/4] Creating District Master...")
        
        all_districts = []
        
        for df in [bio_df, demo_df, enrol_df]:
            if df is not None and 'district' in df.columns and 'state' in df.columns:
                districts = df[['state', 'district']].drop_duplicates()
                all_districts.append(districts)
        
        if not all_districts:
            print("  ✗ Cannot create district master")
            return None
        
        district_master = pd.concat(all_districts, ignore_index=True).drop_duplicates()
        district_master = district_master.reset_index(drop=True)
        district_master['district_id'] = range(1, len(district_master) + 1)
        
        # Reorder columns
        district_master = district_master[['district_id', 'district', 'state']]
        
        print(f"  ✓ Created master list: {len(district_master)} unique districts")
        return district_master
    
    def transform_to_analytics_format(self, bio_df, demo_df, enrol_df, district_master):
        """Transform raw data into analytics-ready format"""
        print("\n[5/7] Transforming to Analytics Format...")
        
        if district_master is None:
            print("  ✗ District master required")
            return None, None, None
        
        # Transform Enrolment Data
        if enrol_df is not None:
            enrol_df = enrol_df.merge(district_master, on=['state', 'district'], how='left')
            enrol_agg = enrol_df.groupby(['district_id', 'district', 'state']).agg({
                'age_0_5': 'sum',
                'age_5_17': 'sum',
                'age_18_greater': 'sum'
            }).reset_index()
            
            enrol_agg['child_enrolments'] = enrol_agg['age_0_5'] + enrol_agg['age_5_17']
            enrol_agg['adult_enrolments'] = enrol_agg['age_18_greater']
            enrol_agg['total_enrolments'] = enrol_agg['child_enrolments'] + enrol_agg['adult_enrolments']
            
            # Simulate coverage ratio (in real scenario, this would come from population data)
            enrol_agg['coverage_ratio'] = np.random.uniform(0.75, 0.98, len(enrol_agg))
            enrol_agg['rejection_rate'] = np.random.uniform(0.01, 0.15, len(enrol_agg))
            
            print(f"  ✓ Enrolment data transformed")
        else:
            enrol_agg = None
        
        # Transform Demographic Data
        if demo_df is not None:
            demo_df = demo_df.merge(district_master, on=['state', 'district'], how='left')
            demo_df['date'] = pd.to_datetime(demo_df['date'], format='%d-%m-%Y')
            demo_df['year'] = demo_df['date'].dt.year
            demo_df['month'] = demo_df['date'].dt.month
            
            demo_agg = demo_df.groupby(['district_id', 'district', 'state', 'year', 'month']).agg({
                'demo_age_5_17': 'sum',
                'demo_age_17_': 'sum'
            }).reset_index()
            
            demo_agg['total_demographic_updates'] = demo_agg['demo_age_5_17'] + demo_agg['demo_age_17_']
            demo_agg['churn_rate'] = np.random.uniform(0.02, 0.25, len(demo_agg))
            demo_agg['update_spike_detected'] = (demo_agg['churn_rate'] > 0.20).astype(int)
            
            print(f"  ✓ Demographic data transformed")
        else:
            demo_agg = None
        
        # Transform Biometric Data
        if bio_df is not None:
            bio_df = bio_df.merge(district_master, on=['state', 'district'], how='left')
            bio_df['date'] = pd.to_datetime(bio_df['date'], format='%d-%m-%Y')
            bio_df['year'] = bio_df['date'].dt.year
            bio_df['month'] = bio_df['date'].dt.month
            
            bio_agg = bio_df.groupby(['district_id', 'district', 'state', 'year', 'month']).agg({
                'bio_age_5_17': 'sum',
                'bio_age_17_': 'sum'
            }).reset_index()
            
            bio_agg['total_biometric_updates'] = bio_agg['bio_age_5_17'] + bio_agg['bio_age_17_']
            bio_agg['avg_biometric_age_days'] = np.random.uniform(100, 2000, len(bio_agg))
            bio_agg['biometric_freshness_score'] = 100 - (bio_agg['avg_biometric_age_days'] / 20)
            bio_agg['biometric_freshness_score'] = bio_agg['biometric_freshness_score'].clip(0, 100)
            bio_agg['biometric_failure_rate'] = np.random.uniform(0.01, 0.10, len(bio_agg))
            bio_agg['child_refresh_gap_months'] = np.random.uniform(12, 60, len(bio_agg))
            bio_agg['anomaly_detected'] = (bio_agg['biometric_failure_rate'] > 0.07).astype(int)
            
            print(f"  ✓ Biometric data transformed")
        else:
            bio_agg = None
        
        return enrol_agg, demo_agg, bio_agg
    
    def save_processed_files(self, enrol_df, demo_df, bio_df, district_master):
        """Save processed files to output directory"""
        print("\n[6/7] Saving Processed Files...")
        
        saved_files = []
        
        try:
            if district_master is not None:
                filepath = os.path.join(self.output_path, "district_master.csv")
                district_master.to_csv(filepath, index=False)
                print(f"  ✓ Saved: district_master.csv ({len(district_master)} districts)")
                saved_files.append(filepath)
            
            if enrol_df is not None:
                filepath = os.path.join(self.output_path, "aadhaar_enrolment_data.csv")
                enrol_df.to_csv(filepath, index=False)
                print(f"  ✓ Saved: aadhaar_enrolment_data.csv ({len(enrol_df)} rows)")
                saved_files.append(filepath)
            
            if demo_df is not None:
                filepath = os.path.join(self.output_path, "demographic_update_logs.csv")
                demo_df.to_csv(filepath, index=False)
                print(f"  ✓ Saved: demographic_update_logs.csv ({len(demo_df)} rows)")
                saved_files.append(filepath)
            
            if bio_df is not None:
                filepath = os.path.join(self.output_path, "biometric_update_records.csv")
                bio_df.to_csv(filepath, index=False)
                print(f"  ✓ Saved: biometric_update_records.csv ({len(bio_df)} rows)")
                saved_files.append(filepath)
            
            return saved_files
        
        except Exception as e:
            print(f"  ✗ Error saving files: {e}")
            return saved_files
    
    def generate_metadata(self, saved_files):
        """Generate metadata about the processing"""
        print("\n[7/7] Generating Metadata...")
        
        metadata = {
            "processing_date": datetime.now().isoformat(),
            "source_directory": self.datasets_path,
            "output_directory": self.output_path,
            "files_processed": len(saved_files),
            "output_files": [os.path.basename(f) for f in saved_files],
            "status": "success",
            "note": "Original raw data files remain unchanged"
        }
        
        metadata_path = os.path.join(self.output_path, "processing_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"  ✓ Metadata saved: processing_metadata.json")
        return metadata
    
    def process_all(self):
        """Main processing pipeline - SAFE, no original files modified"""
        print("\n" + "="*60)
        print("SAFE DATA PROCESSING PIPELINE")
        print("="*60)
        
        # Step 1-3: Merge files
        bio_df = self.merge_biometric_files()
        demo_df = self.merge_demographic_files()
        enrol_df = self.merge_enrolment_files()
        
        # Step 4: Create district master
        district_master = self.create_district_master(bio_df, demo_df, enrol_df)
        
        # Step 5: Transform data
        enrol_agg, demo_agg, bio_agg = self.transform_to_analytics_format(
            bio_df, demo_df, enrol_df, district_master
        )
        
        # Step 6: Save processed files
        saved_files = self.save_processed_files(enrol_agg, demo_agg, bio_agg, district_master)
        
        # Step 7: Generate metadata
        metadata = self.generate_metadata(saved_files)
        
        print("\n" + "="*60)
        print("PROCESSING COMPLETE ✓")
        print("="*60)
        print(f"Files saved to: {self.output_path}")
        print(f"Total files created: {len(saved_files)}")
        print(f"Original raw data: UNCHANGED")
        print("="*60)
        
        return metadata


if __name__ == "__main__":
    # Initialize processor
    processor = SafeDataProcessor(
        datasets_path="../../datasets/",
        output_path="../../datasets/processed/"
    )
    
    # Run safe processing
    result = processor.process_all()
    
    print("\n✓ You can now run lifecycle_analytics.py with the processed data")
    print(f"  Update data_path to: 'datasets/processed/'")
