import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from core.config import SENDGRID_API_KEY, FROM_EMAIL

def send_email(to_email: str, team_id: str, password: str):
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject="Hackathon Login Credentials",
        html_content=f"""
        <p>Hello Team <strong>{team_id}</strong>,</p>
        <p>Your login credentials for the hackathon portal are:</p>
        <ul>
            <li><strong>Team ID:</strong> {team_id}</li>
            <li><strong>Password:</strong> {password}</li>
        </ul>
        <p>Please log in and change your password after first login.</p>
        <p>Best of luck!</p>
        """
    )
    try:
        sg = SendGridAPIClient(api_key=SENDGRID_API_KEY)
        sg.send(message)
        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Error sending email to {to_email}: {e}")
