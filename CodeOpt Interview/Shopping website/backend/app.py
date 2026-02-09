from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import config
from models import db, Product
from routes import auth_bp, products_bp, orders_bp, users_bp, payments_bp, admin_bp
import os


def create_app(config_name='development'):
    """Application factory"""
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    JWTManager(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(admin_bp)

    # Create database tables
    with app.app_context():
        db.create_all()
        # Add sample products if they don't exist
        if Product.query.count() == 0:
            add_sample_products()

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {'status': 'Backend is running successfully!'}, 200

    return app


def add_sample_products():
    """Add sample products to database"""
    from models import Product

    sample_products = [
        Product(
            name='All-Purpose Flour',
            description='High-quality all-purpose flour for baking',
            price=5.99,
            image_url='imgs/flour_PNG2.png',
            stock=100,
            category='Flour'
        ),
        Product(
            name='Wholewheat Spaghetti',
            description='Nutritious whole wheat pasta',
            price=3.49,
            image_url='imgs/spaghetti_PNG14.png',
            stock=150,
            category='Pasta'
        ),
        Product(
            name='Premium Rice',
            description='Long-grain premium quality rice',
            price=7.99,
            image_url='imgs/rice_PNG17.png',
            stock=200,
            category='Rice'
        )
    ]

    for product in sample_products:
        db.session.add(product)

    db.session.commit()


if __name__ == '__main__':
    app = create_app(os.environ.get('FLASK_ENV', 'development'))
    app.run(debug=True, host='0.0.0.0', port=5000)
