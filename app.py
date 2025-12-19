from flask import Flask, render_template, request, jsonify, url_for, redirect, session
import requests
import firebase_admin
from firebase_admin import credentials, auth
from users import registerUser
from dotenv import load_dotenv
import os


load_dotenv()

app = Flask(__name__)

app.secret_key = os.getenv('FLASK_SECRET_KEY')

cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)


GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET')


@app.route('/', methods = ['GET', 'POST'])
def index():
    return render_template('index.html')



@app.route('/auth/github')
def github_login():
    github_authorize_url = "https://github.com/login/oauth/authorize"
    redirect_uri = url_for('github_callback', _external = True)
    return redirect(f"{github_authorize_url}?client_id={GITHUB_CLIENT_ID}&redirect_uri={redirect_uri}&scope=user:email")



@app.route('/auth/github/callback')
def github_callback():
    code = request.args.get("code")
    if not code:
        return "Authorization faile", 400
    

    #EXCHANGE CODE FOR ACCESSS TOKEN
    token_url = "https://github.com/login/oauth/access_token"
    headers = {"Accept" : "application/json"}
    data = {
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code
    }

    token_res = requests.get(token_url, headers=headers, data=data).json()
    access_token = token_res.get("access_token")
    if not access_token:
        return "Failed to get access token"
    

    #FETCHING USER IFNFO
    user_res = requests.get("https://api.github.com/user", headers ={
        "Authorization": f"token {access_token}"
    }).json()


    email_res = requests.get("https://api.github.com/user/emails", headers= {
        "Authorization": f"token {access_token}"
    }).json()

    primary_email = next((e['email'] for e in email_res if e["primary"]), None)

    uid = str(user_res.get('id'))
    email = primary_email
    name = user_res.get('name') or user_res.get('login')
    picture = user_res.get('avatar_url')
    provider = "github"



    #SAVING USER IN BG
    registerUser(uid, name, email, picture, provider)
    #SAVE SESSSION
    session["uid"] = uid

    return redirect('/dashboard')



@app.route('/auth/login', methods=['POST'])
def auth_login():
    try:
        data = request.get_json()
        token = data.get("token")

        decoded = auth.verify_id_token(token)
        print("Decoded token:", decoded)

        uid = decoded.get('uid')
        email = decoded.get('email')
        picture = decoded.get('picture')
        name = decoded.get('name')
        provider = decoded.get('sign_in_provider')

        registerUser(uid, name, email, picture, provider)

        #SAVE SESSION
        session['uid'] = uid

        return jsonify({"success": True})

    except Exception as e:
        print("AUTH ERROR:", e)
        return jsonify({"success": False, "error": str(e)}), 401

@app.route('/dashboard')
def dashboard():
    user = session.get('uid')
    if not user:
        return redirect('/')
    
    return render_template('dashboard.html',)





if __name__ == "__main__":
    app.run(debug=True)
