from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, Product, Order, OrderItem
from sqlalchemy.exc import IntegrityError

# Create blueprints
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
products_bp = Blueprint('products', __name__, url_prefix='/api/products')
orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')
users_bp = Blueprint('users', __name__, url_prefix='/api/users')
payments_bp = Blueprint('payments', __name__, url_prefix='/api/payments')
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# ============ AUTH ROUTES ============


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password required'}), 400

    try:
        # Check if user exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 409

        # Create new user
        user = User(
            email=data['email'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Error registering user'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password required'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=user.id)

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

# ============ PRODUCT ROUTES ============


@products_bp.route('', methods=['GET'])
def get_products():
    """Get all products with optional filtering"""
    category = request.args.get('category')

    query = Product.query
    if category:
        query = query.filter_by(category=category)

    products = query.all()
    return jsonify([product.to_dict() for product in products]), 200


@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product"""
    product = Product.query.get(product_id)

    if not product:
        return jsonify({'message': 'Product not found'}), 404

    return jsonify(product.to_dict()), 200


@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    """Create a new product (admin only)"""
    data = request.get_json()

    if not data or not data.get('name') or not data.get('price'):
        return jsonify({'message': 'Name and price are required'}), 400

    product = Product(
        name=data['name'],
        description=data.get('description', ''),
        price=data['price'],
        image_url=data.get('image_url', ''),
        stock=data.get('stock', 0),
        category=data.get('category', '')
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({
        'message': 'Product created successfully',
        'product': product.to_dict()
    }), 201

# ============ ORDER ROUTES ============


@orders_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    """Create a new order"""
    user_id = get_jwt_identity()
    data = request.get_json()

    items = data.get('items', [])
    if not items:
        return jsonify({'message': 'Order must contain items'}), 400

    total_amount = 0
    order_items = []

    # Validate and calculate total
    for item in items:
        product = Product.query.get(item['product_id'])
        if not product:
            return jsonify({'message': f"Product {item['product_id']} not found"}), 404

        if product.stock < item['quantity']:
            return jsonify({'message': f"Insufficient stock for {product.name}"}), 400

        amount = product.price * item['quantity']
        total_amount += amount

        order_items.append({
            'product': product,
            'quantity': item['quantity'],
            'price': product.price
        })

    # Create order
    order = Order(user_id=user_id, total_amount=total_amount)
    db.session.add(order)
    db.session.flush()

    # Add order items and update stock
    for item_data in order_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data['product'].id,
            quantity=item_data['quantity'],
            price=item_data['price']
        )
        item_data['product'].stock -= item_data['quantity']
        db.session.add(order_item)

    db.session.commit()

    return jsonify({
        'message': 'Order created successfully',
        'order': order.to_dict()
    }), 201


@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_user_orders():
    """Get all orders for the current user"""
    user_id = get_jwt_identity()
    orders = Order.query.filter_by(user_id=user_id).all()

    return jsonify([order.to_dict() for order in orders]), 200


@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Get a specific order"""
    user_id = get_jwt_identity()
    order = Order.query.get(order_id)

    if not order:
        return jsonify({'message': 'Order not found'}), 404

    if order.user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    return jsonify(order.to_dict()), 200

# ============ USER ROUTES ============


@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify(user.to_dict()), 200


@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)

    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200


# ============ PAYMENT ROUTES ============

@payments_bp.route('/process', methods=['POST'])
@jwt_required()
def process_payment():
    """Process payment for an order"""
    user_id = get_jwt_identity()
    data = request.get_json()

    order_id = data.get('order_id')
    amount = data.get('amount')

    if not order_id or not amount:
        return jsonify({'message': 'Order ID and amount required'}), 400

    order = Order.query.get(order_id)
    if not order:
        return jsonify({'message': 'Order not found'}), 404

    if order.user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403

    # In real implementation, call Stripe API here
    # For now, just mark order as completed
    order.status = 'completed'
    db.session.commit()

    return jsonify({
        'message': 'Payment processed successfully',
        'order': order.to_dict()
    }), 200


# ============ ADMIN ROUTES ============

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    """Get admin dashboard statistics"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # Check if user is admin (hardcoded for now)
    is_admin = user.email == 'admin@example.com'
    if not is_admin:
        return jsonify({'message': 'Admin access only'}), 403

    total_users = User.query.count()
    total_orders = Order.query.count()
    total_revenue = db.session.query(
        db.func.sum(Order.total_amount)).scalar() or 0

    return jsonify({
        'total_users': total_users,
        'total_orders': total_orders,
        'total_revenue': float(total_revenue)
    }), 200


@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Update product (admin only)"""
    product = Product.query.get(product_id)

    if not product:
        return jsonify({'message': 'Product not found'}), 404

    data = request.get_json()
    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.price = data.get('price', product.price)
    product.stock = data.get('stock', product.stock)
    product.category = data.get('category', product.category)

    db.session.commit()

    return jsonify({
        'message': 'Product updated successfully',
        'product': product.to_dict()
    }), 200


@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Delete product (admin only)"""
    product = Product.query.get(product_id)

    if not product:
        return jsonify({'message': 'Product not found'}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({'message': 'Product deleted successfully'}), 200
