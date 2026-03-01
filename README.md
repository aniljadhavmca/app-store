# 🛍 Mini E-Commerce Store  
AWS + Flask + Stripe + RDS + ALB

A production-style mini eCommerce system built using:

- AWS EC2 (Frontend + Backend)
- Application Load Balancer (ALB)
- RDS MySQL
- Flask (Python Backend API)
- Nginx (Frontend Static Server)
- Stripe Checkout
- systemd (Auto-start backend service)

---

## 🛍 Store Homepage

![Store Home](https://raw.githubusercontent.com/aniljadhavmca/app-store/main/images/store-1.png)

---

## 🛒 Cart Sidebar

![Cart Page](https://raw.githubusercontent.com/aniljadhavmca/app-store/main/images/store-cart1.png)

---

## 💳 Stripe Payment Page

![Stripe Payment](https://github.com/aniljadhavmca/app-store/blob/main/images/store-payment-getway.png)

# 🏗 Architecture

Internet  
↓  
Application Load Balancer (HTTP:80)  
├── /* → Frontend EC2 (Nginx :80)  
└── /api/* → Backend EC2 (Flask :5000)  
      ↓  
     RDS MySQL  


---

# 🚀 FULL SETUP GUIDE

---

# PART 1 — RDS DATABASE SETUP

## 1️⃣ Create RDS MySQL

Configuration:

- Engine: MySQL
- Database name: storedb
- Username: admin
- Password: admin1234
- Public access: Yes (for learning)
- Security Group: Allow MySQL (3306) from Backend EC2 security group

Connect:

mysql -h YOUR_RDS_ENDPOINT -u admin -p

Create table:

USE storedb;

DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    address TEXT,
    total_amount INT,
    items TEXT,
    stripe_session_id VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Exit MySQL.

---

# PART 2 — BACKEND EC2 SETUP

## 2️⃣ Create Backend EC2

Security Group:

- Allow SSH (22) from your IP
- Allow Port 5000 from ALB Security Group

Install:

sudo apt update  
sudo apt install python3-venv python3-pip -y  

mkdir ~/storeapp  
cd ~/storeapp  

python3 -m venv venv  
source venv/bin/activate  

pip install flask flask-cors stripe sqlalchemy pymysql  

---

## 3️⃣ Create Backend File

Create:

/home/ubuntu/storeapp/app.py

Paste backend code and update:

- Stripe Secret Key
- RDS endpoint
- ALB DNS in success_url and cancel_url

---

## 4️⃣ Test Backend

/storeapp/app.py

source venv/bin/activate

python app.py  

You should see:

Running on http://0.0.0.0:5000  

Test:

curl localhost:5000/api/products  

If JSON returns → backend working.

---

# PART 3 — BACKEND AUTO START

Create service:

sudo nano /etc/systemd/system/storeapp.service

Paste:

[Unit]
Description=StoreApp
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/storeapp
ExecStart=/home/ubuntu/storeapp/venv/bin/python app.py
Restart=always

[Install]
WantedBy=multi-user.target

Enable:

sudo systemctl daemon-reload  
sudo systemctl start storeapp  
sudo systemctl enable storeapp  
sudo systemctl status storeapp  

Status should show: active (running)

---

# PART 4 — FRONTEND EC2 SETUP

## 5️⃣ Create Frontend EC2

Security Group:

- Allow HTTP (80) from ALB Security Group
- Allow SSH from your IP

Install nginx:

sudo apt update  
sudo apt install nginx -y  

Go to:

cd /var/www/html  

Create files:

- index.html
- style.css
- app.js
- success.html
- dashboard.html

Paste frontend code into each file.

Restart nginx:

sudo systemctl restart nginx  

---

# PART 5 — APPLICATION LOAD BALANCER

## 6️⃣ Create ALB

- Type: Application Load Balancer
- Internet-facing
- Listener: HTTP :80
- Attach 2 public subnets

---

## Create Target Groups

FrontendTG:
- Port: 80
- Register Frontend EC2

BackendTG:
- Port: 5000
- Register Backend EC2
- Health check path: /

---

## Listener Rules

Priority 1:
Path = /api/*
Forward → BackendTG

Default:
Forward → FrontendTG

---

# PART 6 — STRIPE SETUP

## 7️⃣ Stripe Configuration

1. Create account at https://stripe.com  
2. Go to Developers → API Keys  
3. Copy Secret Key  
4. Replace in backend:

stripe.api_key = "sk_test_YOUR_SECRET_KEY"

---

## Stripe Test Card

4242 4242 4242 4242  
Any future expiry  
Any CVC  
Any ZIP  

---

# APPLICATION FEATURES

- Product listing with images
- Add to cart
- Cart sidebar with overlay
- Quantity update
- Live total calculation
- Delivery details form
- Stripe checkout
- Order stored in RDS
- Receipt page
- Orders dashboard
- Backend auto-start
- ALB path routing

---

# RECEIPT PAGE

URL format:

/success.html?session_id=...

Calls:

/api/order/<session_id>

Displays:

- Customer name
- Email
- Address
- Total
- Order date

---

# DASHBOARD PAGE

URL:

/dashboard.html

Calls:

/api/orders

Displays all stored orders.

---

# TROUBLESHOOTING

## 502 Bad Gateway

Backend not running or port 5000 blocked.

Check:

sudo systemctl status storeapp

---

## Products Not Loading

Test:

/api/products

If 502 → backend issue  
If 404 → ALB rule issue  

---

## Stripe Not Redirecting

Check browser Network tab:

/api/create-checkout-session

---

# SECURITY IMPROVEMENTS

For production:

- Make RDS private
- Use HTTPS (ACM)
- Store Stripe key in environment variables
- Use Gunicorn
- Add authentication (JWT)
- Use S3 for images
- Add Auto Scaling Group
- Add CI/CD pipeline

---

# FINAL TEST FLOW

Open:

http://YOUR_ALB_DNS

Test:

1. Add products
2. Open cart
3. Enter delivery details
4. Checkout
5. Pay with Stripe test card
6. View receipt
7. Open dashboard

---

# WHAT YOU BUILT

You built a full cloud-based eCommerce system with:

- AWS Infrastructure
- Load Balancing
- Backend API
- Database Integration
- Payment Gateway
- Modern UI
- Production auto-start service

This is real-world architecture.
