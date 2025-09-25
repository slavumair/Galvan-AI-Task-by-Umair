Project Name: Galvan AI
Project Description:

Galvan AI is a role-based authentication web application designed to provide secure user registration and login, along with separate dashboards for regular users and a Super Admin. The system integrates OTP-based registration for user verification and implements JWT-based authentication to protect sensitive routes.

The project demonstrates a complete full-stack implementation with both frontend and backend functionality, including user management, role-based access control, and secure session handling.

Functionalities:

1. User Features:

OTP-based Registration: Users register with first name, last name, email, password, and mobile number. OTP verification ensures valid email.

Login: Users log in with their email and password after verification.

Dashboard: Personalized dashboard displaying user information.

Logout: Logs the user out and redirects to the landing page.

2. Super Admin Features:

Predefined Credentials: Super Admin login is predefined in the system.

User Management Dashboard:

View all registered users

Create new users directly

Edit user information

Delete users

Role-based Access Control: Only Super Admin can access admin dashboard and manage users.

3. Security & Backend Features:

JWT Authentication: Protects dashboard and API routes.

Role-based access control: Differentiates between Super Admin and regular users.

Password hashing: Uses secure hashing via Werkzeug.

SQLite Database: Stores user information securely.

CORS Enabled: Allows frontend-backend communication.

Tech Stack:

Backend:

Flask (Python)

Flask-SQLAlchemy (Database ORM)

Flask-JWT-Extended (Authentication)

Flask-CORS (Cross-origin requests)

SQLite (Database)

Frontend:

Next.js (React Framework)

React Hooks (useState, useEffect)

Axios (HTTP Requests)

Other Tools:

JWT Tokens (Authentication)

OTP Simulation (Console-based, can be extended to real email)

Setup Instructions

Backend Setup (Flask):

Clone the repository and navigate to the backend folder:

git clone https://github.com/yourusername/galvan-ai.git
cd galvan-ai/backend


Create a virtual environment:

python -m venv .venv


Activate the virtual environment:

Windows: .venv\Scripts\activate

Linux/Mac: source .venv/bin/activate

Install dependencies:

pip install -r requirements.txt


Run the backend server:

python main.py


The backend will start on http://127.0.0.1:5000.

The database (users.db) is created automatically.

Frontend Setup (Next.js):

Navigate to the frontend folder:

cd ../frontend


Install dependencies:

npm install


Run the frontend development server:

npm run dev


The frontend will start on http://localhost:3000.

Make sure the backend is running before using the frontend for API requests to work.

Notes:

Super Admin credentials: Email: admin@galvan.ai Password: SuperSecurePassword123

Regular users must register and verify OTP before logging in.
