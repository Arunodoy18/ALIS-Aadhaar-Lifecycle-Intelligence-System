import streamlit as st
import pandas as pd

st.set_page_config(layout="wide")

# Header
st.markdown(
    """
    <div style="background-color:#3b6fb6;padding:20px;border-radius:10px">
        <h1 style="color:white">Aadhaar Lifecycle Intelligence System</h1>
        <p style="color:white">Predictive monitoring of Aadhaar quality</p>
    </div>
    """,
    unsafe_allow_html=True
)

st.write("")

# KPI Cards
col1, col2, col3 = st.columns(3)

col1.metric("Lifecycle Health Score", "0.62")
col2.metric("High Risk Districts", "48")
col3.metric("Biometric Update Risk", "Critical")

st.write("")

# District Table
st.subheader("District-wise Aadhaar Lifecycle Risk")

data = pd.DataFrame({
    "District": ["Angul", "Majitar"],
    "Lifecycle Score": [0.41, 0.58],
    "Risk Level": ["High", "Medium"]
})

st.dataframe(data, use_container_width=True)

st.write("")

# Trend placeholder
st.subheader("Lifecycle Trend Overview")
st.line_chart({
    "Enrolment": [35, 40, 42, 38, 45],
    "Updates": [20, 22, 21, 30, 32],
    "Biometric": [30, 35, 38, 36, 40]
})

st.write("")

# Recommendations
st.subheader("System Recommendations")
st.markdown("""
- Conduct biometric update camps in high-risk districts  
- School-based Aadhaar refresh programs  
- Mobile enrolment units for low-coverage areas  
""")
