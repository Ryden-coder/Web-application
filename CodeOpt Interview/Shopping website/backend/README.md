# Shopping Website - Flask Backend

A Python Flask backend API for the shopping website with user authentication, product management, and order processing.

## Features

- **User Authentication** - Register and login with JWT tokens
- **Product Management** - Browse and manage products
- **Shopping Cart & Orders** - Create and track orders
- **User Profiles** - Manage user information
- **Stock Management** - Track product inventory

## Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   copy .env.example .env
   ```
   Edit `.env` and set your `JWT_SECRET_KEY`

3. **Run the Flask server:**
   ```bash
   python app.py
   ```

The backend will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products?category=<category>` - Filter by category
- `GET /api/products/<id>` - Get single product
- `POST /api/products` - Create product (requires JWT)

### Orders
- `POST /api/orders` - Create new order (requires JWT)
- `GET /api/orders` - Get user's orders (requires JWT)
- `GET /api/orders/<id>` - Get specific order (requires JWT)

### Users
- `GET /api/users/profile` - Get user profile (requires JWT)
- `PUT /api/users/profile` - Update user profile (requires JWT)

## Testing

Example requests using curl:

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password","first_name":"John","last_name":"Doe"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

**Get Products:**
```bash
curl http://localhost:5000/api/products
```

**Create Order:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"items":[{"product_id":1,"quantity":2}]}'
```

## Database

The backend uses SQLite by default (`shopping.db`). Database models:
- **User** - User accounts with authentication
- **Product** - Product catalog
- **Order** - Customer orders
- **OrderItem** - Items in an order

## Environment Variables

- `FLASK_ENV` - Set to 'development' or 'production'
- `JWT_SECRET_KEY` - Secret key for JWT token generation
- `DATABASE_URL` - Database connection string

## Frontend Integration

Update your frontend JavaScript to call these endpoints:

```javascript
// Register
fetch('/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email, password, first_name, last_name})
})

// Get Products
fetch('/api/products')

// Create Order
fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  },
  body: JSON.stringify({items: cartItems})
})
```
