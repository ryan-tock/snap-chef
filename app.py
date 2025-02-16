from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

app.config["JWT_SECRET_KEY"] = "your_secret_key"
jwt = JWTManager(app)

@app.route("/api/hello", methods=["GET"])
def hello():
    return jsonify({"message": "Hello from Flask Backend!"})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    if data["username"] == "admin" and data["password"] == "password":
        token = create_access_token(identity=data["username"])
        return jsonify({"token": token})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/", methods=["GET"])
def index():
    return jsonify("Welcome to the Flask API")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)