import streamlit as st

import segno
import io

@st.dialog("Share Class Link")
def share_subject_dialog(subject_name, subject_code):

    st.markdown("""
<style>

/* Title + labels */
h1,h2,h3,h4,h5,h6,
p,label,span{
    color:white !important;
}

/* Text input ka text */
.stTextInput input{
    color:white !important;
}

/* Placeholder */
.stTextInput input::placeholder{
    color:white !important;
    opacity:1;
}

/* Input label */
.stTextInput label{
    color:white !important;
}

/* Button text */
.stButton button{
    color:white !important;
}

/* Caption (QR ke niche text) */
.stCaption{
    color:white !important;
}

/* Markdown text */
.stMarkdown{
    color:white !important;
}

</style>
""", unsafe_allow_html=True)

    app_domain = "http://localhost:8501"

    join_url = f"{app_domain}/?join-code={subject_code}"

    st.subheader(f"Share Join Link")

    qr = segno.make(join_url)

    out = io.BytesIO()

    qr.save(out, kind='png', scale=10, border=1)

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("### Copy Link")

        st.code(join_url, language="text")

        st.code(subject_code, language="text")

        st.info("Copy this link to share on Whatsapp or Email")

    with col2:
        st.markdown("### Scan to Join")

        st.image(
            out.getvalue(),
            caption="QRCODE for class joining"
        )

