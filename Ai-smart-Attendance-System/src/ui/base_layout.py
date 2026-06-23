import streamlit as st


def style_background_home():

    st.markdown("""
         <style>
                  .stApp{
                      background: #FFD6E8 !important;
                }
                
               #    .stApp div[data-testid="stColumn"]{
               #  background-color:#E0E3FF !important;
               #  padding:2.5 rem !important;
               #  border-radius:5 rem !important
               #  }

         </style>
                
                 """
                ,unsafe_allow_html=True)
    
def style_background_dashbord():

      st.markdown("""
         <style>
                  .stApp{
                      background: #FFD6E8   !important;
                }

         </style>
                
                 """
                ,unsafe_allow_html=True)
      
def style_base_layout():
#asdasd
      st.markdown("""
         <style>
         @import url('https://fonts.googleapis.com/css2?family=Climate+Crises:YEAR@1979&display=swap');         
         @import url(('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');   
                     
                  
                  /*Hide Top Bar of streamlit */   
                  
                  #MainMenu, footer, header{
                     visibility:hidden;
                  }

                  .block-container{
                      padding-top:1.5rem !important;
                  }

                  h3,h4,h5,h6,
                  p,
                  label,
                  span,
                  div {
                     color: black ;
                  }
  
                  h1{
                     font-family: 'Climate Crises', sans-serif !important;
                     font-size: 3.5rem !important;
                     line-height:1.1 !important;
                     margin-bottom:0rem !important;   
                              
                     }

                   h2{
                     font-family: 'Climate Crises', sans-serif !important;
                     font-size: 2rem !important;
                     line-height:0.9 !important;
                     margin-bottom:0rem !important;   
                              
                      }

                   h3,h4,p{
                         font-family: 'Outfit', sans-serif;
                     }
                  
                  button{
                       border-radius: 1.5rem !important;
                       background: #5865F2 !important;
                       color: white !important;
                       padding: 10px 20px !important;
                       transition: transform 0.25s ease-in-out !important
                  }

                 button[kind="secondary"]{
                       border-radius: 1.5rem !important;
                       background: #EB459E !important;
                       color: white !important;
                       padding: 10px 20px !important;
                       transition: transform 0.25s ease-in-out !important
                  }    

                 button[kind="tertiary"]{
                       border-radius: 1.5rem !important;
                       background: black !important;
                       color: white !important;
                       padding: 10px 20px !important;
                       transition: transform 0.25s ease-in-out !important
                  }   

                  button:hover{
                     transform: scale(1.05)            
                  }        

                

                  button,
                  button p,
                  button span {
                     color: white !important;
                  }  

                  /* Streamlit toast text white */
                div[data-testid="stToast"] *{
                    color: white !important;
                }

                /* Toast background */
                div[data-testid="stToast"]{
                    background-color:#222 !important;
                }            

         </style>
                
                 """
                ,unsafe_allow_html=True) 
      

      
