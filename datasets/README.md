# ALIS Datasets Documentation

## Correct Directory Structure

This folder should contain the following datasets and structure:

```
datasets/
├── README.md                          # This file
├── generate_datasets.py               # Script to generate/process datasets
├── aadhaar_enrolment_data.csv        # Main enrollment records
├── biometric_update_records.csv      # Biometric update logs
├── demographic_update_logs.csv       # Demographic change records
└── district_master.csv               # District reference data
```

## Dataset Descriptions

### 1. aadhaar_enrolment_data.csv
**Purpose:** Contains Aadhaar enrollment records with demographic and geographic information.

**Expected Columns:**
- Enrollment ID
- State
- District
- Date of Enrollment
- Age Group
- Gender
- Status
- Additional demographic fields

### 2. biometric_update_records.csv
**Purpose:** Tracks biometric authentication and update activities.

**Expected Columns:**
- Record ID
- Aadhaar Number (masked/encrypted)
- Update Date
- Update Type (fingerprint, iris, face)
- Authentication Status
- Failure Reason (if applicable)
- District/State

### 3. demographic_update_logs.csv
**Purpose:** Logs demographic information updates over time.

**Expected Columns:**
- Update ID
- Aadhaar Number (masked/encrypted)
- Update Date
- Field Updated (name, address, mobile, etc.)
- Previous Value
- New Value
- Verification Status
- District/State

### 4. district_master.csv
**Purpose:** Master reference data for all districts in India.

**Expected Columns:**
- District Code
- District Name
- State Code
- State Name
- Region
- Population
- Area (sq km)
- Additional geographic metadata

## API Data Folders (Root Level)

The following folders should be at the **project root** level, not inside the datasets folder:

```
UIDAI_ADHAR-PROJ/
├── api_data_aadhar_biometric/        # Biometric API data (chunked CSVs)
│   ├── api_data_aadhar_biometric_0_500000.csv
│   ├── api_data_aadhar_biometric_500000_1000000.csv
│   ├── api_data_aadhar_biometric_1000000_1500000.csv
│   └── api_data_aadhar_biometric_1500000_1861108.csv
│
├── api_data_aadhar_demographic/      # Demographic API data (chunked CSVs)
│   ├── api_data_aadhar_demographic_0_500000.csv
│   ├── api_data_aadhar_demographic_500000_1000000.csv
│   ├── api_data_aadhar_demographic_1000000_1500000.csv
│   ├── api_data_aadhar_demographic_1500000_2000000.csv
│   └── api_data_aadhar_demographic_2000000_2071700.csv
│
├── api_data_aadhar_enrolment/        # Enrollment API data (chunked CSVs)
│   ├── api_data_aadhar_enrolment_0_500000.csv
│   ├── api_data_aadhar_enrolment_500000_1000000.csv
│   └── api_data_aadhar_enrolment_1000000_1006029.csv
│
└── datasets/                          # This folder (reference datasets)
```

## Data Chunking Strategy

API data is split into chunks for efficient processing:
- **Biometric data:** ~1.86M records split into 4 files (~500K each)
- **Demographic data:** ~2.07M records split into 5 files (~500K each)
- **Enrollment data:** ~1.01M records split into 3 files (~500K each)

## Usage Notes

1. **Reference Datasets** (in this folder) are used for:
   - Initial data analysis
   - ML model training
   - District reference lookups
   - Baseline statistics

2. **API Data Folders** (at root) are used for:
   - Real-time API queries
   - Large-scale batch processing
   - Production data serving
   - Analytics pipeline

## Data Privacy & Security

⚠️ **IMPORTANT:**
- All Aadhaar numbers must be masked/encrypted
- PII (Personally Identifiable Information) should be anonymized
- Access to raw data should be restricted to authorized personnel only
- Follow UIDAI data protection guidelines

## Data Integrity

- All CSV files should have headers in the first row
- Maintain consistent column naming across chunks
- Use UTF-8 encoding for all files
- Date format: YYYY-MM-DD
- Timestamps: ISO 8601 format

## Contact

For dataset-related queries or issues, contact the ALIS Data Team.

---
**Last Updated:** January 18, 2026  
**Version:** 1.0
