-- Run this ONCE in pgAdmin 4 Query Tool (connected as the postgres superuser)
-- It creates all databases and users needed to run the backend locally.

-- AUTH SERVICE
CREATE USER auth_user WITH PASSWORD 'auth_pass';
CREATE DATABASE auth_db OWNER auth_user;
GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;
\c auth_db
GRANT ALL ON SCHEMA public TO auth_user;

-- PRODUCT SERVICE
\c template1
CREATE USER product_user WITH PASSWORD 'product_pass';
CREATE DATABASE product_db OWNER product_user;
GRANT ALL PRIVILEGES ON DATABASE product_db TO product_user;
\c product_db
GRANT ALL ON SCHEMA public TO product_user;

-- ORDER SERVICE
\c template1
CREATE USER order_user WITH PASSWORD 'order_pass';
CREATE DATABASE order_db OWNER order_user;
GRANT ALL PRIVILEGES ON DATABASE order_db TO order_user;
\c order_db
GRANT ALL ON SCHEMA public TO order_user;

-- INVENTORY SERVICE
\c template1
CREATE USER inventory_user WITH PASSWORD 'inventory_pass';
CREATE DATABASE inventory_db OWNER inventory_user;
GRANT ALL PRIVILEGES ON DATABASE inventory_db TO inventory_user;
\c inventory_db
GRANT ALL ON SCHEMA public TO inventory_user;

-- USER SERVICE
\c template1
CREATE USER user_user WITH PASSWORD 'user_pass';
CREATE DATABASE user_db OWNER user_user;
GRANT ALL PRIVILEGES ON DATABASE user_db TO user_user;
\c user_db
GRANT ALL ON SCHEMA public TO user_user;

-- PAYMENT SERVICE
\c template1
CREATE USER payment_user WITH PASSWORD 'payment_pass';
CREATE DATABASE payment_db OWNER payment_user;
GRANT ALL PRIVILEGES ON DATABASE payment_db TO payment_user;
\c payment_db
GRANT ALL ON SCHEMA public TO payment_user;
