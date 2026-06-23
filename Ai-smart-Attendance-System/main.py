import streamlit as st

st.markdown("""
<style>
[data-testid="stDialog"] *{
    color:white !important;
}

[data-testid="stTextInput"] input{
    color:white !important;
    -webkit-text-fill-color:white !important;
}

[data-testid="stTextInput"] input::placeholder{
    color:white !important;
}

[data-testid="stDialog"] button p{
    color:white !important;
}
</style>
""", unsafe_allow_html=True)

from src.screens.home_screen import home_screen 
from src.screens.teacher_screen import teacher_screen 
from src.screens.student_screen import student_screen 

from src.components.dialog_auto_enroll import auto_enroll_dialog


def main():
    st.set_page_config(
       page_title="FaceTrackAI-main.streamlit.app",
       page_icon ="data:image/png;base64,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"
    )

    if 'login_type' not in st.session_state:
        st.session_state['login_type'] = None 

    match st.session_state['login_type']:
        case 'teacher':
            teacher_screen()

        case 'student':
            student_screen()

        case None:
            home_screen()    

    join_code = st.query_params.get('join-code')

    if join_code:

      if st.session_state.login_type != 'student':

        st.session_state.login_type = 'student'
        st.rerun()

      if st.session_state.get('is_logged_in') and st.session_state.get('user_role') == 'student':

        auto_enroll_dialog(join_code)                

main()    


