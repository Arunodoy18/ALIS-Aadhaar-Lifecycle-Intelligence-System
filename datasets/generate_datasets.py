import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import json

np.random.seed(42)

INDIAN_DISTRICTS = [
    {"state": "Andhra Pradesh", "districts": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"]},
    {"state": "Arunachal Pradesh", "districts": ["Anjaw", "Changlang", "East Kameng", "East Siang", "Itanagar", "Kurung Kumey", "Lohit", "Lower Subansiri", "Papum Pare", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"]},
    {"state": "Assam", "districts": ["Baksa", "Barpeta", "Bongaigaon", "Cachar", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "Tinsukia", "Udalguri"]},
    {"state": "Bihar", "districts": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"]},
    {"state": "Chhattisgarh", "districts": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"]},
    {"state": "Delhi", "districts": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"]},
    {"state": "Goa", "districts": ["North Goa", "South Goa"]},
    {"state": "Gujarat", "districts": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"]},
    {"state": "Haryana", "districts": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"]},
    {"state": "Himachal Pradesh", "districts": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"]},
    {"state": "Jharkhand", "districts": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"]},
    {"state": "Karnataka", "districts": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"]},
    {"state": "Kerala", "districts": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"]},
    {"state": "Madhya Pradesh", "districts": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"]},
    {"state": "Maharashtra", "districts": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"]},
    {"state": "Manipur", "districts": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"]},
    {"state": "Meghalaya", "districts": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"]},
    {"state": "Mizoram", "districts": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"]},
    {"state": "Nagaland", "districts": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"]},
    {"state": "Odisha", "districts": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"]},
    {"state": "Punjab", "districts": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Mohali", "Muktsar", "Nawanshahr", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Tarn Taran"]},
    {"state": "Rajasthan", "districts": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"]},
    {"state": "Sikkim", "districts": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"]},
    {"state": "Tamil Nadu", "districts": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"]},
    {"state": "Telangana", "districts": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"]},
    {"state": "Tripura", "districts": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"]},
    {"state": "Uttar Pradesh", "districts": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Rae Bareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"]},
    {"state": "Uttarakhand", "districts": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"]},
    {"state": "West Bengal", "districts": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"]},
    {"state": "Andaman and Nicobar Islands", "districts": ["Nicobar", "North and Middle Andaman", "South Andaman"]},
    {"state": "Chandigarh", "districts": ["Chandigarh"]},
    {"state": "Dadra and Nagar Haveli and Daman and Diu", "districts": ["Dadra and Nagar Haveli", "Daman", "Diu"]},
    {"state": "Jammu and Kashmir", "districts": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"]},
    {"state": "Ladakh", "districts": ["Kargil", "Leh"]},
    {"state": "Lakshadweep", "districts": ["Lakshadweep"]},
    {"state": "Puducherry", "districts": ["Karaikal", "Mahe", "Puducherry", "Yanam"]}
]

all_districts = []
for state_data in INDIAN_DISTRICTS:
    state = state_data["state"]
    for district in state_data["districts"]:
        all_districts.append({"state": state, "district": district})

print(f"Total districts: {len(all_districts)}")

def generate_enrolment_data():
    data = []
    for idx, d in enumerate(all_districts):
        population = np.random.randint(500000, 5000000)
        enrolment_rate = np.random.uniform(0.75, 0.99)
        total_enrolments = int(population * enrolment_rate)
        adult_enrolments = int(total_enrolments * np.random.uniform(0.70, 0.85))
        child_enrolments = total_enrolments - adult_enrolments
        enrolment_centres = np.random.randint(50, 500)
        avg_processing_time = np.random.uniform(5, 30)
        rejection_rate = np.random.uniform(0.01, 0.15)
        
        data.append({
            "district_id": f"D{idx+1:04d}",
            "district_name": d["district"],
            "state": d["state"],
            "population": population,
            "total_enrolments": total_enrolments,
            "adult_enrolments": adult_enrolments,
            "child_enrolments": child_enrolments,
            "coverage_ratio": round(enrolment_rate, 4),
            "enrolment_centres": enrolment_centres,
            "avg_processing_days": round(avg_processing_time, 2),
            "rejection_rate": round(rejection_rate, 4),
            "first_enrolment_date": (datetime(2010, 1, 1) + timedelta(days=np.random.randint(0, 365*3))).strftime("%Y-%m-%d"),
            "last_updated": datetime.now().strftime("%Y-%m-%d")
        })
    return pd.DataFrame(data)

def generate_demographic_update_data():
    data = []
    for idx, d in enumerate(all_districts):
        base_updates = np.random.randint(10000, 200000)
        
        for year in range(2020, 2026):
            yearly_updates = int(base_updates * np.random.uniform(0.8, 1.5))
            
            address_updates = int(yearly_updates * np.random.uniform(0.30, 0.50))
            name_updates = int(yearly_updates * np.random.uniform(0.05, 0.15))
            dob_updates = int(yearly_updates * np.random.uniform(0.02, 0.08))
            mobile_updates = int(yearly_updates * np.random.uniform(0.20, 0.35))
            email_updates = int(yearly_updates * np.random.uniform(0.10, 0.20))
            gender_updates = int(yearly_updates * np.random.uniform(0.001, 0.01))
            
            update_spike = np.random.choice([True, False], p=[0.1, 0.9])
            if update_spike:
                yearly_updates = int(yearly_updates * np.random.uniform(1.5, 3.0))
                
            data.append({
                "district_id": f"D{idx+1:04d}",
                "district_name": d["district"],
                "state": d["state"],
                "year": year,
                "total_demographic_updates": yearly_updates,
                "address_updates": address_updates,
                "name_updates": name_updates,
                "dob_updates": dob_updates,
                "mobile_updates": mobile_updates,
                "email_updates": email_updates,
                "gender_updates": gender_updates,
                "update_spike_detected": update_spike,
                "avg_update_frequency_days": round(365 / max(yearly_updates / 10000, 1), 2),
                "churn_rate": round(np.random.uniform(0.05, 0.30), 4)
            })
    return pd.DataFrame(data)

def generate_biometric_update_data():
    data = []
    for idx, d in enumerate(all_districts):
        base_population = np.random.randint(500000, 3000000)
        
        for year in range(2020, 2026):
            fingerprint_updates = int(base_population * np.random.uniform(0.02, 0.15))
            iris_updates = int(base_population * np.random.uniform(0.01, 0.08))
            photo_updates = int(base_population * np.random.uniform(0.03, 0.12))
            
            child_biometric_updates = int(base_population * 0.15 * np.random.uniform(0.05, 0.25))
            senior_biometric_updates = int(base_population * 0.12 * np.random.uniform(0.03, 0.15))
            
            avg_biometric_age_days = np.random.randint(365, 2500)
            
            biometric_failure_rate = np.random.uniform(0.02, 0.20)
            if avg_biometric_age_days > 1500:
                biometric_failure_rate *= np.random.uniform(1.2, 1.8)
                
            last_update_gap_months = np.random.randint(6, 48)
            
            anomaly_detected = np.random.choice([True, False], p=[0.08, 0.92])
            
            data.append({
                "district_id": f"D{idx+1:04d}",
                "district_name": d["district"],
                "state": d["state"],
                "year": year,
                "fingerprint_updates": fingerprint_updates,
                "iris_updates": iris_updates,
                "photo_updates": photo_updates,
                "total_biometric_updates": fingerprint_updates + iris_updates + photo_updates,
                "child_biometric_updates": child_biometric_updates,
                "senior_biometric_updates": senior_biometric_updates,
                "avg_biometric_age_days": avg_biometric_age_days,
                "biometric_freshness_score": round(max(0, 100 - (avg_biometric_age_days / 25)), 2),
                "biometric_failure_rate": round(min(biometric_failure_rate, 0.35), 4),
                "last_update_gap_months": last_update_gap_months,
                "child_refresh_gap_months": np.random.randint(12, 60),
                "anomaly_detected": anomaly_detected,
                "authentication_success_rate": round(1 - biometric_failure_rate, 4)
            })
    return pd.DataFrame(data)

def generate_district_master():
    data = []
    for idx, d in enumerate(all_districts):
        lat = np.random.uniform(8.0, 35.0)
        lng = np.random.uniform(68.0, 97.0)
        
        data.append({
            "district_id": f"D{idx+1:04d}",
            "district_name": d["district"],
            "state": d["state"],
            "latitude": round(lat, 4),
            "longitude": round(lng, 4),
            "region": np.random.choice(["North", "South", "East", "West", "Central", "Northeast"]),
            "urban_rural_ratio": round(np.random.uniform(0.2, 0.9), 2),
            "literacy_rate": round(np.random.uniform(0.55, 0.98), 4),
            "internet_penetration": round(np.random.uniform(0.25, 0.85), 4)
        })
    return pd.DataFrame(data)

print("Generating datasets...")

enrolment_df = generate_enrolment_data()
demographic_df = generate_demographic_update_data()
biometric_df = generate_biometric_update_data()
district_master_df = generate_district_master()

enrolment_df.to_csv("datasets/aadhaar_enrolment_data.csv", index=False)
demographic_df.to_csv("datasets/demographic_update_logs.csv", index=False)
biometric_df.to_csv("datasets/biometric_update_records.csv", index=False)
district_master_df.to_csv("datasets/district_master.csv", index=False)

print("Datasets generated successfully!")
print(f"Enrolment data: {len(enrolment_df)} records")
print(f"Demographic updates: {len(demographic_df)} records")
print(f"Biometric updates: {len(biometric_df)} records")
print(f"District master: {len(district_master_df)} records")
