import sqlite3
# import smtplib
# from email.mime.text import MIMEText
# import random



DB_PATH = 'database.db'

# def sendEmail(email):

#     SENDER_EMAIL = "equo@gmail.com"
#     APP_PASSWORD = ""

#     msg = MIMEText("Tnks for joining")

#     msg['Subject'] = "Email Verification"
#     msg['From'] = SENDER_EMAIL
#     msg['To'] = email



#     server = smtplib.SMTP("smtp.gmail.com", 587)
#     server.starttls()
#     server.login(SENDER_EMAIL, APP_PASSWORD)
#     server.sendmail(SENDER_EMAIL, email, msg.as_string())
#     server.quit()




# REGISTER USER
def registerUser(uid, name, email, picture, provider):

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    #CHECK USER IF EXIST
    query = "SELECT 1 FROM users WHERE uid = ?"
    cursor.execute(query, (uid,))
    row = cursor.fetchone()
    if not row:
        query_saveUser = "INSERT INTO users (uid, name, email, picture, provider) VALUES (?, ?, ?, ?, ?)"
        cursor.execute(query_saveUser, (uid, name, email, picture, provider))
        conn.commit()

        # sendEmail(email)

    else:
        pass



