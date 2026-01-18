import sys
sys.argv = ['streamlit', 'run', 'UI/udai.py', '--server.port', '8501', '--server.headless', 'true']
from streamlit.web.cli import main
main()
