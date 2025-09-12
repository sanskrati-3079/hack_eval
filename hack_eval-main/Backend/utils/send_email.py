import smtplib
import ssl
from email.message import EmailMessage
import logging
import os
from dotenv import load_dotenv

load_dotenv()
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_email(to_email: str, team_id: str, password: str):
    """
    Send login credentials to team leader via Gmail SMTP

    Args:
        to_email (str): Recipient email address
        team_id (str): Generated team ID
        password (str): Generated password

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        subject = "Hackathon Login Credentials - GLA University"
        html_content = f"""
        <html>
        <body>
            <h2>Welcome to GLA University Hackathon!</h2>
            <p>Congratulations! Your team has been shortlisted for the hackathon. Below are your login credentials:</p>
            <ul>
                <li><strong>Team ID:</strong> {team_id}</li>
                <li><strong>Password:</strong> {password}</li>
                <li><strong>Email:</strong> {to_email}</li>
            </ul>
            <p><strong>Instructions:</strong></p>
            <ul>
                <li>Keep these credentials safe and secure</li>
                <li>Use these credentials to login to the hackathon portal</li>
                <li>Do not share these credentials with anyone outside your team</li>
                <li>Contact the organizers if you face any login issues</li>
            </ul>
            <p>Best of luck!</p>
            <p>This is an automated email. Please do not reply.</p>
        </body>
        </html>
        """
        plain_text_content = f"""
        Welcome to GLA University Hackathon!

        Congratulations! Your team has been shortlisted for the hackathon.

        Team ID: {team_id}
        Password: {password}
        Email: {to_email}

        Instructions:
        - Keep these credentials safe and secure
        - Use these credentials to login to the hackathon portal
        - Do not share these credentials with anyone outside your team
        - Contact the organizers if you face any login issues

        Best of luck!
        This is an automated email. Please do not reply.
        """

        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        msg.set_content(plain_text_content)
        msg.add_alternative(html_content, subtype='html')

        # Connect to Gmail SMTP server
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.send_message(msg)

        logger.info(f"Email sent successfully to {to_email} for team {team_id}")
        return True

    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {str(e)}")
        return False

# import os
# from sendgrid import SendGridAPIClient
# from sendgrid.helpers.mail import Mail
# from core.config import SENDGRID_API_KEY, FROM_EMAIL

# def send_email(to_email: str, team_id: str, password: str):
#     message = Mail(
#         from_email=FROM_EMAIL,
#         to_emails=to_email,
#         subject="Hackathon Login Credentials",
#         html_content=f"""
#         <p>Hello Team <strong>{team_id}</strong>,</p>
#         <p>Your login credentials for the hackathon portal are:</p>
#         <ul>
#             <li><strong>Team ID:</strong> {team_id}</li>
#             <li><strong>Password:</strong> {password}</li>
#         </ul>
#         <p>Please log in and change your password after first login.</p>
#         <p>Best of luck!</p>
#         """
#     )
#     try:
#         sg = SendGridAPIClient(api_key=SENDGRID_API_KEY)
#         sg.send(message)
#         print(f"Email sent to {to_email}")
#     except Exception as e:
#         print(f"Error sending email to {to_email}: {e}")
