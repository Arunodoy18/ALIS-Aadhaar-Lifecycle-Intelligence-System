import streamlit as st
import pandas as pd
from PIL import Image

st.set_page_config(layout="wide")

# Load logo
logo = Image.open("Adhar.png")

# Header section with logo
col_logo, col_title = st.columns([1, 6])

with col_logo:
    st.image(logo, width=100)

with col_title:
    st.markdown(
        """
        <h1 style="margin-bottom:0;">Aadhaar Lifecycle Intelligence System</h1>
        <p style="margin-top:0; color:gray;">
        Predictive monitoring of Aadhaar quality
        </p>
        """,
        unsafe_allow_html=True
    )

st.markdown("---")

st.subheader("📊 Key Performance Indicators")

col1, col2, col3 = st.columns(3)

col1.metric("Lifecycle Health Score", "0.62", "+0.08 vs last month")
col2.metric("High Risk Districts", "48", "↓ 3 from last month")
col3.metric("Biometric Update Risk", "Critical", "Action needed")

st.subheader("🗺️ District-wise Aadhaar Lifecycle Risk Analysis")

data = pd.DataFrame({
    "District": ["Angul", "Majitar", "Nashik", "Erode", "Patna"],
    "Lifecycle Score": [0.41, 0.58, 0.72, 0.65, 0.38],
    "Risk Level": ["High", "Medium", "Low", "Medium", "High"],
    "Population": ["850K", "720K", "1.2M", "950K", "1.5M"],
    "Action Required": ["Yes", "Yes", "No", "Yes", "Yes"]
})

st.dataframe(data, use_container_width=True)

st.subheader("📈 Lifecycle Trend Overview (6 Months)")
st.line_chart({
    "Enrolment": [35, 40, 42, 38, 45, 52],
    "Updates": [20, 22, 21, 30, 32, 38],
    "Biometric": [30, 35, 38, 36, 40, 48]
})

st.markdown("---")

st.subheader("🚀 Recommended Actions")
col_rec1, col_rec2 = st.columns(2)

with col_rec1:
    st.markdown("""
    **Immediate Priority (Next 30 Days)**
    - Deploy biometric update camps in 48 high-risk districts
    - Target: 500K individuals for biometric refresh
    - Expected impact: +12% lifecycle health score
    """)

with col_rec2:
    st.markdown("""
    **Medium-term Plan (3-6 Months)**
    - Launch school-based Aadhaar refresh programs
    - Deploy 50 mobile enrolment units
    - Expected impact: Stabilize lifecycle scores
    """)
