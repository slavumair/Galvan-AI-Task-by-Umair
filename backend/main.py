# main.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from functools import wraps
import random, string, time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 86400  # 1 day

db = SQLAlchemy(app)
jwt = JWTManager(app)

# User model with role
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    mobile_number = db.Column(db.String(20), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    role = db.Column(db.String(20), default="user")  # "user" or "superadmin"

with app.app_context():
    db.create_all()

    # Predefine a super admin if not exists
    if not User.query.filter_by(email="admin@galvan.ai").first():
        superadmin = User(
            first_name="Super",
            last_name="Admin",
            email="admin@galvan.ai",
            password=generate_password_hash("SuperSecurePassword123", method='pbkdf2:sha256'),
            mobile_number="0000000000",
            is_verified=True,
            role="superadmin"
        )
        db.session.add(superadmin)
        db.session.commit()
        print("Super Admin created.")

# Temporary OTP storage
otp_storage = {}  # key: email, value: {'otp': '123456', 'expiry': timestamp, 'data': {}}

# Helper to generate OTP
def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

# Role-based decorator for superadmin
def superadmin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        email = get_jwt_identity()
        user = User.query.filter_by(email=email).first()
        if not user or user.role != "superadmin":
            return jsonify({"error": "Access denied"}), 403
        return fn(*args, **kwargs)
    return wrapper

# ==========================
# Registration: Request OTP
# ==========================
@app.route('/register/request', methods=['POST'])
def request_otp():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    mobile_number = data.get('mobile_number')

    if not all([first_name, last_name, email, password, mobile_number]):
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    otp = generate_otp()
    expiry = time.time() + 300  # 5 minutes
    otp_storage[email] = {'otp': otp, 'expiry': expiry, 'data': data}

    # Simulate email sending
    print(f"=== OTP for {email} ===")
    print(f"Your OTP is: {otp}")
    print("=======================")

    return jsonify({"message": "OTP sent (simulated)", "otp_reference": email}), 200

# ==========================
# Registration: Verify OTP
# ==========================
@app.route('/register/verify', methods=['POST'])
def verify_otp():
    data = request.get_json()
    otp_reference = data.get('otp_reference')
    otp_input = data.get('otp')

    if otp_reference not in otp_storage:
        return jsonify({"error": "No OTP request found for this email"}), 400

    otp_info = otp_storage[otp_reference]

    if time.time() > otp_info['expiry']:
        otp_storage.pop(otp_reference)
        return jsonify({"error": "OTP expired"}), 400

    if otp_input != otp_info['otp']:
        return jsonify({"error": "Invalid OTP"}), 400

    user_data = otp_info['data']
    hashed_password = generate_password_hash(user_data['password'], method='pbkdf2:sha256', salt_length=16)

    new_user = User(
        first_name=user_data['first_name'],
        last_name=user_data['last_name'],
        email=user_data['email'],
        password=hashed_password,
        mobile_number=user_data['mobile_number'],
        is_verified=True,
        role="user"
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        otp_storage.pop(otp_reference)
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ==========================
# Login
# ==========================
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
    if not user.is_verified:
        return jsonify({"error": "Email not verified"}), 403
    if not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=email)
    refresh_token = create_refresh_token(identity=email)
    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "role": user.role,
        "message": f"Welcome {user.first_name}!"
    }), 200

# ==========================
# User Dashboard
# ==========================
@app.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    return jsonify({
        "user": {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "mobile_number": user.mobile_number,
            "role": user.role
        }
    }), 200

# ==========================
# Super Admin User Management
# ==========================
@app.route('/admin/users', methods=['GET'])
@superadmin_required
def get_users():
    users = User.query.filter(User.role != "superadmin").all()
    return jsonify([{
        "id": u.id,
        "first_name": u.first_name,
        "last_name": u.last_name,
        "email": u.email,
        "mobile_number": u.mobile_number,
        "role": u.role
    } for u in users])

@app.route('/admin/users', methods=['POST'])
@superadmin_required
def create_user():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 409
    new_user = User(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        password=generate_password_hash(data['password']),
        mobile_number=data['mobile_number'],
        role="user",
        is_verified=True
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created"}), 201

@app.route('/admin/users/<int:user_id>', methods=['PUT'])
@superadmin_required
def edit_user(user_id):
    data = request.get_json()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.mobile_number = data.get('mobile_number', user.mobile_number)
    if data.get('password'):
        user.password = generate_password_hash(data['password'])
    db.session.commit()
    return jsonify({"message": "User updated"})

@app.route('/admin/users/<int:user_id>', methods=['DELETE'])
@superadmin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"})

# ==========================
# Refresh Token
# ==========================
@app.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    return jsonify({"access_token": new_access_token}), 200

# Run server
if __name__ == '__main__':
    app.run(debug=True)
