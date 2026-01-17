import streamlit as st
import pandas as pd
from PIL import Image

st.set_page_config(layout="wide")

# Load logo
logo = Image.open("adhar.png")

# Header section with logo
col_logo, col_title = st.columns([1, 6])

with col_logo:
    st.image(logo, width=100)

with col_title:
    st.markdown(
        
        <h1 style="margin-bottom:0;">Aadhaar Lifecycle Intelligence System</h1>
        <p style="margin-top:0; color:gray;">
        Predictive monitoring of Aadhaar quality
        </p>
        ,
        unsafe_allow_html=True
    )

st.markdown("---")

# KPI Cards
col1, col2, col3 = st.columns(3)

col1.metric("Lifecycle Health Score", "0.62")
col2.metric("High Risk Districts", "48")
col3.metric("Biometric Update Risk", "Critical")

st.subheader("District-wise Aadhaar Lifecycle Risk")

data = pd.DataFrame({
    "District": ["Angul", "Majitar"],
    "Lifecycle Score": [0.41, 0.58],
    "Risk Level": ["High", "Medium"]
})

st.dataframe(data, use_container_width=True)

st.subheader("Lifecycle Trend Overview")
st.line_chart({
    "Enrolment": [35, 40, 42, 38, 45],
    "Updates": [20, 22, 21, 30, 32],
    "Biometric": [30, 35, 38, 36, 40]
})

st.subheader("System Recommendations")
st.markdown(
- Conduct biometric update camps in high-risk districts  
- School-based Aadhaar refresh programs  
- Mobile enrolment units for low-coverage areas  
)
