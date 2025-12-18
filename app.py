from flask import Flask, render_template, request, jsonify
import firebase_admin
from firebase_admin import credentials, auth


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
        return jsonify({"success": True})

    except Exception as e:
        print("AUTH ERROR:", e)
        return jsonify({"success": False, "error": str(e)}), 401

@app.route('/dashboard')
def dashboard():
    return "Logged in successfully 🎉"





if __name__ == "__main__":
    app.run(debug=True)
