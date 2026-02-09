# Shopping Website

A small shopping website with a Flask backend and a modular ES6 frontend.

Features
- Product catalog served from a Flask API
- User registration & login (JWT)
- Shopping cart (localStorage)
- Orders and checkout flow (mock payment)
- Order history page
- Admin panel (product management, stats)

Prerequisites
- Python 3.10+ (or the system Python used to create the venv)
- Git (recommended) or a ZIP transfer

Quick start (Windows PowerShell)
1. Get the project (clone or unzip into a folder)

2. Create & activate a virtual environment
```powershell
cd "C:\path\to\Shopping website\backend"
python -m venv ..\.venv
..\.venv\Scripts\Activate.ps1
```

3. Install backend dependencies
```powershell
cd "C:\path\to\Shopping website\backend"
pip install -r requirements.txt
copy .env.example .env
# edit .env if you want to change JWT secret or database
```

4. Start the Flask backend (new terminal if needed)
```powershell
cd "C:\path\to\Shopping website\backend"
..\.venv\Scripts\Activate.ps1
python app.py
```
Backend default: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

5. Serve the frontend (separate terminal)
```powershell
cd "C:\path\to\Shopping website"
python -m http.server 8000
```
Open: `http://localhost:8000`

Notes
- Do NOT open `Website.html` directly via `file:///` — run a local server as above to avoid CORS issues.
- If ports conflict, change the port and update `modules/api.js` `API_BASE_URL` accordingly.
- A test admin account is recognized by email `admin@example.com`. Register that email to access admin API routes.

Working with the project
- Frontend modules are in `modules/` (ES6 modules): `api.js`, `auth.js`, `cart.js`, `products.js`, `orders.js`, `admin.js`, `payment.js`.
- Main entry: `main.js` (imports modules and initializes the app).
- Backend API: `backend/app.py`, `backend/routes.py`, `backend/models.py` (SQLite used by default). The DB file `shopping.db` is created in the `backend` folder.

Testing the flow
1. Start backend and frontend as above.
2. Open site: Register (Account → register) using an email (e.g., `test@example.com` / `password123`).
3. Login (Account → login).
4. Add products to cart, click the cart icon, and checkout. Payment is mocked — backend marks orders completed.
5. View order history (Account → orders).
6. Register `admin@example.com` and login; then Account → admin to open the admin panel.

Troubleshooting
- If `Activate.ps1` fails: run PowerShell as Admin once and run:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
- If `pip install` fails, make sure the venv is activated and you have network access.

If you'd like, I can:
- Add real Stripe integration and instructions to `README.md`.
- Create a zip of the project for sharing.
- Push the project and the README to a Git repo.

File: [README.md](Shopping%20website/README.md)
