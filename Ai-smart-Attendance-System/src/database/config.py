import streamlit as st

from supabase import create_client, Client

supabase: Client = create_client(
    st.secrets["NEXT_PUBLIC_SUPABASE_URL"],
    st.secrets["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]
)

