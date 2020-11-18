import importlib
from email.header import Header
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email import encoders
import smtplib
import sys
import copy
sys.path.append("..")


def send_email(file_name, file_content=None):
    try:
        import setting
        importlib.reload(setting)
    except Exception as e:
        print(e)
        return
    receiver_emails = setting.RECEIVER_EMAILS + [setting.EMAIL_SENDER]
    if file_content:
        isinstance(file_content, bytes)
    smtp_obj = smtplib.SMTP_SSL(setting.EMAIL_HOST, setting.EMAIL_PORT)
    smtp_obj.set_debuglevel(1)
    smtp_obj.login(setting.EMAIL_SENDER, setting.EMAIL_PASS)
    
    message = MIMEMultipart()
    message['From'] = setting.EMAIL_SENDER
    message['To'] = ','.join(receiver_emails)
    message['Subject'] = Header('文件: ' + file_name, 'utf-8')

    email_file = MIMEApplication(file_content)
    encoders.encode_base64(email_file)
    email_file.set_payload(email_file.get_payload())
    copy_email_file = copy.deepcopy(email_file)
    email_file.add_header('Content-Disposition',
                          'attachment; filename="{}"'.format(file_name))
    copy_message = copy.deepcopy(message)
    message.attach(email_file)

    try:
        smtp_obj.sendmail(setting.EMAIL_SENDER, receiver_emails, message.as_string())
    except smtplib.SMTPDataError as e:
        print(e)
        print('try to send')
        content = MIMEText('文件名: ' + file_name, 'html')
        copy_email_file.add_header('Content-Disposition',
                          'attachment; filename="{}"'.format('file'))
        copy_message.attach(content)
        copy_message.attach(copy_email_file)
        smtp_obj.sendmail(setting.EMAIL_SENDER, receiver_emails, copy_message.as_string())
    smtp_obj.quit()

