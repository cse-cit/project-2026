import streamlit as st

def footer_home():

    st.markdown(f"""
        <div style="margin-top:2rem; display:flex; gap:6px; justify-content:center; item-align:center"
                <p style="font-weight:bold; color:white">Created BY The Innovators💖</p>
        </div>
                
               """, unsafe_allow_html=True)
  
def footer_dashboard():

    st.markdown(f"""
        <div style="margin-top:2rem; display:flex; gap:6px; justify-content:center; item-align:center"
                <p style="font-weight:bold; color:black">Created By The Innovators💖</p>
        </div>
                
               """, unsafe_allow_html=True)

