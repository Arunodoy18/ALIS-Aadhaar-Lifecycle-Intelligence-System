import streamlit as st
import pandas as pd

st.set_page_config(layout="wide")

st.title("Aadhaar Lifecycle Intelligence System")
st.caption("Predictive monitoring of Aadhaar quality")

col1, col2, col3 = st.columns(3)

col1.metric("Lifecycle Health Score", "0.62")
col2.metric("High Risk Districts", "48")
col3.metric("Biometric Update Risk", "Critical")

st.subheader("District-wise Aadhaar Lifecycle Risk")

df = pd.DataFrame({
    "District": ["Angul", "Majitar"],
    "Lifecycle Score": [0.41, 0.58],
    "Risk Level": ["High", "Medium"]
})

st.dataframe(df, use_container_width=True)

st.subheader("System Recommendations")
st.write("""
• Conduct biometric update camps  
• School-based Aadhaar refresh  
• Mobile enrolment units  
""")