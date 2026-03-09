-- AUTH SERVICE
CREATE USER auth_user WITH PASSWORD 'auth_pass';
CREATE DATABASE auth_db OWNER auth_user;
GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;

-- PRODUCT SERVICE
CREATE USER product_user WITH PASSWORD 'product_pass';
CREATE DATABASE product_db OWNER product_user;
GRANT ALL PRIVILEGES ON DATABASE product_db TO product_user;

-- ORDER SERVICE
CREATE USER order_user WITH PASSWORD 'order_pass';
CREATE DATABASE order_db OWNER order_user;
GRANT ALL PRIVILEGES ON DATABASE order_db TO order_user;

-- INVENTORY SERVICE
CREATE USER inventory_user WITH PASSWORD 'inventory_pass';
CREATE DATABASE inventory_db OWNER inventory_user;
GRANT ALL PRIVILEGES ON DATABASE inventory_db TO inventory_user;