import streamlit as st
from src.database.db import create_subject

st.markdown("""
<style>

/* Dialog title */
[data-testid="stDialog"] h1{
    color: white !important;
}

/* Dialog normal text */
[data-testid="stDialog"] p{
    color: white !important;
}

/* Label text */
[data-testid="stDialog"] label{
    color: white !important;
}

/* Input text */
[data-testid="stDialog"] input{
    color: white !important;
}

/* Placeholder */
[data-testid="stDialog"] input::placeholder{
    color: white !important;
    opacity: 1;
}

/* Button text */
[data-testid="stDialog"] button{
    color: white !important;
}

</style>
""", unsafe_allow_html=True)

@st.dialog("Create New Subject")
def create_subject_dialog(teacher_id):
    st.write("Enter the details of new subject")

    sub_id = st.text_input("Subject Code", placeholder="CS101")
    sub_name = st.text_input(
        "Subject Name",
        placeholder="Introduction to Computer Science"
    )
    sub_section = st.text_input("Section", placeholder="A")

    if st.button("Create Subject Now", type="primary", width="stretch"):
        if sub_id and sub_name and sub_section:
            try:
                create_subject(sub_id, sub_name, sub_section, teacher_id)

                st.toast("Subject Created Successfully!")
                st.rerun()

            except Exception as e:
                st.error(f"Error: {str(e)}")

        else:
            st.warning("Please fill all the fields")

