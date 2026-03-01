from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text
import stripe
import json

app = Flask(__name__)
CORS(app)

stripe.api_key = "YOUR_STRIPE_SECRET"

engine = create_engine(
    "mysql+pymysql://admin:admin1234@YOUR_RDS_ENDPOINT:3306/storedb"
)

PRODUCTS = {
    1: {
        "name": "Laptop",
        "price": 50000,
        "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"
    },
    2: {
        "name": "Phone",
        "price": 25000,
        "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    },
    3: {
        "name": "Headphones",
        "price": 5000,
        "image": "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=800"
    },
    4: {
        "name": "Keyboard",
        "price": 3000,
        "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800"
    },
    5: {
        "name": "Mouse",
        "price": 1500,
        "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"
    }
}

@app.route("/api/products")
def products():
    return jsonify(PRODUCTS)

@app.route("/api/create-checkout-session", methods=["POST"])
def checkout():
    data = request.json
    cart = data["cart"]
    customer = data["customer"]

    line_items = []
    total = 0

    for item in cart:
        product = PRODUCTS[int(item["id"])]
        qty = int(item["qty"])
        total += product["price"] * qty

        line_items.append({
            "price_data": {
                "currency": "inr",
                "product_data": {"name": product["name"]},
                "unit_amount": product["price"] * 100,
            },
            "quantity": qty,
        })

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=line_items,
        mode="payment",
        success_url="http://YOUR_ALB_DNS/success.html?session_id={CHECKOUT_SESSION_ID}",
        cancel_url="http://YOUR_ALB_DNS",
    )

    with engine.connect() as conn:
        conn.execute(text("""
            INSERT INTO orders
            (customer_name, customer_email, address, total_amount, items, stripe_session_id)
            VALUES (:name, :email, :address, :amount, :items, :sid)
        """), {
            "name": customer["name"],
            "email": customer["email"],
            "address": customer["address"],
            "amount": total,
            "items": json.dumps(cart),
            "sid": session.id
        })
        conn.commit()

    return jsonify({"url": session.url})

@app.route("/api/order/<session_id>")
def get_order(session_id):
    with engine.connect() as conn:
        order = conn.execute(text("""
            SELECT * FROM orders WHERE stripe_session_id=:sid
        """), {"sid": session_id}).fetchone()

    return jsonify(dict(order._mapping))

@app.route("/api/orders")
def orders():
    with engine.connect() as conn:
        orders = conn.execute(text("""
            SELECT * FROM orders ORDER BY id DESC
        """)).fetchall()

    return jsonify([dict(row._mapping) for row in orders])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
