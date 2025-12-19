from flask import Flask, render_template, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth
from users import registerUser


app = Flask(__name__)

cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)


@app.route('/', methods = ['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route('/auth/login', methods=['POST'])
def auth_login():
    try:
        data = request.get_json()
        token = data.get("token")

        decoded = auth.verify_id_token(token)
        uid = decoded.get('uid')
        email = decoded.get('email')
        picture = decoded.get('picture')
        name = decoded.get('name')
        provider = decoded.get('sign_in_provider')

        registerUser(uid, name, email, picture, provider)

        return jsonify({"success": True})

    except Exception as e:
        print("AUTH ERROR:", e)
        return jsonify({"success": False, "error": str(e)}), 401

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')





if __name__ == "__main__":
    app.run(debug=True)
