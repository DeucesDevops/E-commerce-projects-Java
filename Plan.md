# Shoe E-Commerce — Project Plan
## React + Spring Boot + Kubernetes

---

## Project Goal

Build a production-ready, microservices-based e-commerce platform for selling shoes.
Scalable, cloud-native, event-driven, secure, and portfolio-ready.

---

## Service Port Map

| Service              | Port |
|----------------------|------|
| api-gateway          | 8080 |
| product-service      | 8081 |
| order-service        | 8082 |
| inventory-service    | 8083 |
| auth-service         | 8084 |
| cart-service         | 8085 |
| payment-service      | 8086 |
| notification-service | 8087 |
| user-service         | 8088 |
| discovery-server     | 8761 |
| frontend             | 5173 (dev) / 80 (prod) |

---

## Phase 1 — MVP (Get It Running End-to-End)

### Step 1 — Project Scaffolding

**Backend monorepo structure:**
```
backend/
  discovery-server/
  api-gateway/
  auth-service/
  user-service/
  product-service/
  inventory-service/
  cart-service/
  order-service/
  payment-service/
  notification-service/
```

**Frontend structure:**
```
frontend/src/
  components/
  pages/
  services/
  hooks/
  store/
  routes/
  utils/
  types/
```

**Each backend service gets:**
- Spring Boot 3 project (Maven)
- `Dockerfile` (multi-stage build)
- `application.yml`
- Eureka client registration

---

### Step 2 — Infrastructure Setup (Docker Compose)

Set up the supporting infrastructure before writing any service logic.

`docker-compose.yml` at project root:
- [ ] PostgreSQL — one instance per service (auth-db, product-db, order-db, inventory-db, payment-db, user-db)
- [ ] Redis — for cart-service and API Gateway rate limiting
- [ ] Kafka + Zookeeper — for async event communication
- [ ] Elasticsearch — for product search
- [ ] All backend services
- [ ] Frontend (Nginx in prod)

---

### Step 3 — Discovery Server

`backend/discovery-server/` — port 8761
- [ ] Spring Boot + `@EnableEurekaServer`
- [ ] `application.yml`: disable self-registration
- [ ] This must start first — all other services register here

---

### Step 4 — Auth Service

`backend/auth-service/` — port 8084

**Database:** `auth-db` (PostgreSQL)
Tables: `users`, `roles`, `refresh_tokens`

**Dependencies:** Spring Web, Spring Data JPA, Spring Security, JJWT, PostgreSQL driver, Eureka Client

**Entities:**
- `User` — id, name, email, password (BCrypt), role, createdAt
- `RefreshToken` — id, token, userId, expiresAt

**Endpoints:**
- `POST /api/auth/register` — hash password with BCrypt, save user, return JWT
- `POST /api/auth/login` — validate credentials, return access token + refresh token
- `POST /api/auth/refresh` — validate refresh token, issue new access token
- `GET /api/auth/validate` — used by API Gateway to validate tokens

**Rules:**
- Passwords: BCrypt only (never plain SHA-256)
- JWT: access token 15 min, refresh token 7 days
- Roles: `USER`, `ADMIN`

---

### Step 5 — API Gateway

`backend/api-gateway/` — port 8080

**Dependencies:** Spring Cloud Gateway, Eureka Client, Redis (rate limiting)

**Responsibilities:**
- Route all requests to correct downstream service
- Validate JWT on every request (except `/api/auth/**`)
- Forward `X-User-Id` and `X-User-Role` headers to services
- Return `401` for missing/invalid tokens
- Handle CORS globally

**Routes:**
```
/api/auth/**        → auth-service
/api/users/**       → user-service
/api/products/**    → product-service
/api/inventory/**   → inventory-service
/api/cart/**        → cart-service
/api/orders/**      → order-service
/api/payments/**    → payment-service
```

**Filters to implement:**
- [ ] `JwtAuthenticationFilter` — validate JWT, extract user identity
- [ ] `RequestLoggingFilter` — log method, path, status, duration
- [ ] Rate limiting — Redis-backed token bucket per IP

---

### Step 6 — Product Service

`backend/product-service/` — port 8081

**Database:** `product-db` (PostgreSQL)
Tables: `products`, `categories`, `product_variants`

**Dependencies:** Spring Web, Spring Data JPA, PostgreSQL driver, Eureka Client

**Entities:**
- `Product` — id, name, description, brand, category, price, imageUrl, featured, createdAt
- `ProductVariant` — id, productId, size, color, sku
- `Category` — id, name (Men, Women, Kids)

**Endpoints:**
- `GET /api/products` — list all, support `?category=`, `?brand=`, `?featured=true`
- `GET /api/products/{id}` — product detail with variants
- `GET /api/products/search?q=` — search by name/brand
- `POST /api/products` — create product (ADMIN only)
- `PUT /api/products/{id}` — update product (ADMIN only)
- `DELETE /api/products/{id}` — delete product (ADMIN only)

---

### Step 7 — Inventory Service

`backend/inventory-service/` — port 8083

**Database:** `inventory-db` (PostgreSQL)
Tables: `inventory`, `stock_movements`

**Dependencies:** Spring Web, Spring Data JPA, PostgreSQL driver, Eureka Client, Kafka

**Entities:**
- `Inventory` — id, productId, size, quantity
- `StockMovement` — id, productId, size, change, reason, createdAt

**Endpoints:**
- `GET /api/inventory/{productId}` — get stock for a product
- `GET /api/inventory/check?productId=&size=` — check if in stock
- `PUT /api/inventory/update` — manually update stock (ADMIN)

**Kafka Listeners:**
- `order.created` → reduce stock for each item in order
- `order.cancelled` → restore stock for each item

---

### Step 8 — Cart Service

`backend/cart-service/` — port 8085

**Storage:** Redis (no SQL database)

**Dependencies:** Spring Web, Spring Data Redis, Eureka Client

**Data structure (Redis Hash):**
```
cart:{userId} → { productId:size → { productId, name, size, color, price, quantity, imageUrl } }
```

**Endpoints:**
- `GET /api/cart` — get cart for authenticated user (userId from header)
- `POST /api/cart/add` — add item or increment quantity
- `PUT /api/cart/update` — update item quantity
- `DELETE /api/cart/remove` — remove one item
- `DELETE /api/cart/clear` — clear entire cart

**Rules:**
- Cart TTL in Redis: 7 days
- userId always comes from `X-User-Id` header (set by API Gateway)

---

### Step 9 — Order Service

`backend/order-service/` — port 8082

**Database:** `order-db` (PostgreSQL)
Tables: `orders`, `order_items`

**Dependencies:** Spring Web, Spring Data JPA, PostgreSQL driver, Eureka Client, Kafka, OpenFeign

**Entities:**
- `Order` — id, userId, status, totalAmount, shippingAddress, customerName, customerEmail, createdAt
- `OrderItem` — id, orderId, productId, productName, size, color, price, quantity

**Order statuses:** `CREATED` → `PAID` → `SHIPPED` → `DELIVERED` | `CANCELLED`

**Endpoints:**
- `POST /api/orders` — create order from cart contents
- `GET /api/orders` — get all orders for authenticated user
- `GET /api/orders/{id}` — get single order detail
- `PUT /api/orders/{id}/status` — update order status (ADMIN)
- `PUT /api/orders/{id}/cancel` — cancel order (USER, only if CREATED/PAID)

**Kafka Events Published:**
- `order.created` — after order is saved
- `order.cancelled` — after order is cancelled
- `order.status.updated` — after status changes to SHIPPED/DELIVERED

---

### Step 10 — Payment Service

`backend/payment-service/` — port 8086

**Database:** `payment-db` (PostgreSQL)
Tables: `payments`, `transactions`

**Dependencies:** Spring Web, Spring Data JPA, PostgreSQL driver, Eureka Client, Kafka, Stripe Java SDK

**Entities:**
- `Payment` — id, orderId, userId, amount, currency, status, stripePaymentIntentId, createdAt
- `Transaction` — id, paymentId, type, amount, status, createdAt

**Endpoints:**
- `POST /api/payments/create-intent` — create Stripe PaymentIntent, return clientSecret to frontend
- `POST /api/payments/confirm` — confirm payment success (called after Stripe webhook or frontend confirmation)
- `GET /api/payments/order/{orderId}` — get payment status for an order

**Stripe Flow:**
1. Frontend calls `POST /api/payments/create-intent` with orderId and amount
2. Service creates Stripe PaymentIntent, saves to DB, returns `clientSecret`
3. Frontend uses Stripe SDK to collect card and confirm payment
4. On success, frontend calls `POST /api/payments/confirm`
5. Service publishes `order.paid` Kafka event

**Kafka Events Published:**
- `order.paid` — after successful payment confirmation

---

### Step 11 — Notification Service

`backend/notification-service/` — port 8087

**No database** (stateless, event-driven)

**Dependencies:** Spring Boot Mail, Kafka, Thymeleaf (email templates)

**Kafka Listeners:**
- `order.created` → email: "Your order has been placed"
- `order.paid` → email: "Payment confirmed, your order is being processed"
- `order.status.updated` (SHIPPED) → email: "Your order is on the way"
- `order.status.updated` (DELIVERED) → email: "Your order has been delivered"
- `order.cancelled` → email: "Your order has been cancelled"

**Email templates (HTML via Thymeleaf):**
- Order confirmation
- Payment receipt
- Shipping notification
- Delivery confirmation
- Cancellation notice

---

### Step 12 — User Service

`backend/user-service/` — port 8088

**Database:** `user-db` (PostgreSQL)
Tables: `user_profiles`, `addresses`

**Dependencies:** Spring Web, Spring Data JPA, PostgreSQL driver, Eureka Client, OpenFeign

**Entities:**
- `UserProfile` — id, userId (from auth-service), name, email, phone, avatarUrl, createdAt
- `Address` — id, userId, label, street, city, state, zip, country, isDefault

**Endpoints:**
- `GET /api/users/me` — get profile for authenticated user
- `PUT /api/users/me` — update profile
- `GET /api/users/me/addresses` — list saved addresses
- `POST /api/users/me/addresses` — add address
- `PUT /api/users/me/addresses/{id}` — update address
- `DELETE /api/users/me/addresses/{id}` — delete address
- `GET /api/users/me/orders` — fetch order history (Feign → order-service)

---

### Step 13 — Frontend

`frontend/` — React + TypeScript + Vite

**State management:** Zustand

**Stores:**
- `authStore` — user, token, login(), logout()
- `cartStore` — items, addItem(), removeItem(), syncWithServer()

**Pages:**
- [ ] `HomePage` — featured products, hero banner
- [ ] `ProductsPage` — grid with filters (category, brand, price, size)
- [ ] `ProductDetailPage` — images, size/color picker, add to cart
- [ ] `CartPage` — cart items, quantities, subtotal, checkout button
- [ ] `CheckoutPage` — shipping form, Stripe card input, place order
- [ ] `LoginPage` — email/password, redirect on success
- [ ] `RegisterPage` — name, email, password, confirm password
- [ ] `OrderHistoryPage` — list of past orders with status
- [ ] `OrderDetailPage` — single order breakdown
- [ ] `ProfilePage` — edit profile, manage addresses
- [ ] `AdminDashboard` — product CRUD, order management (ADMIN role only)

**Hooks:**
- `useAuth()` — login, logout, register, current user
- `useProducts(filters?)` — fetch and filter products
- `useCart()` — cart operations, sync with cart-service
- `useOrders()` — create order, fetch history
- `usePayment()` — create payment intent, confirm

**Services (`services/api.ts`):**
- Axios instance with base URL to api-gateway
- Request interceptor: attach JWT from auth store
- Response interceptor: handle 401 (redirect to login)

---

## Phase 2 — Production Ready ✅

### Kubernetes ✅
For each service:
- [x] `deployment.yaml`
- [x] `service.yaml`
- [x] `configmap.yaml`
- [x] `hpa.yaml` (Horizontal Pod Autoscaler)
- [x] Secrets managed via `k8s/infrastructure/shared-secrets.yaml` + per-DB secrets

Top-level:
- [x] Ingress Controller (Nginx) — `k8s/infrastructure/ingress.yaml`
- [ ] TLS via Cert-Manager (Let's Encrypt) — install cert-manager, add tls block to ingress
- [ ] Helm charts in `helm-charts/` — optional, for parameterised deploys

### CI/CD Pipeline (GitHub Actions) ✅
```
Code Push → main
  → JOB 1: mvn test (all 10 services in parallel)
  → JOB 2: docker build + push to Docker Hub (tagged with git SHA)
  → JOB 3: update image tags in k8s/services/*/deployment.yaml → git commit + push
  → ArgoCD detects the commit → syncs cluster → rolling deploy
  → Prometheus monitors rollout health
```
Files: `.github/workflows/ci-cd.yml`, `.github/workflows/pr-checks.yml`

### ArgoCD (GitOps CD) ✅
ArgoCD watches the `k8s/` directory in Git and auto-deploys any change.

**Install ArgoCD (one-time):**
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl port-forward svc/argocd-server -n argocd 8090:443
```

**Apply the Application manifest:**
```bash
kubectl apply -f argocd/application.yaml
```

**Key behaviours configured in `argocd/application.yaml`:**
- `automated.prune: true` — removes K8s resources deleted from Git
- `automated.selfHeal: true` — reverts manual cluster changes (Git is the truth)
- `ignoreDifferences` on replicas — HPA manages pod count at runtime

**GitHub Secrets required:**
| Secret | Value |
|--------|-------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password or access token |
| `JWT_SECRET` | 64+ char random string |
| `STRIPE_SECRET_KEY` | `sk_live_...` from Stripe dashboard |
| `MAIL_USERNAME` | SMTP email address |
| `MAIL_PASSWORD` | SMTP app password |

---

## Phase 3 — Enterprise Grade

### Elasticsearch (Product Search)
- [ ] Add `spring-data-elasticsearch` to product-service
- [ ] `ProductDocument` mapped for ES indexing
- [ ] Sync products to ES via Kafka on create/update
- [ ] Fuzzy search, filter by price range, brand, size, color
- [ ] Replace SQL `LIKE` queries with ES queries

### Observability ✅
- [x] Prometheus — `micrometer-registry-prometheus` in every service, `k8s/infrastructure/prometheus.yaml`
- [x] Grafana — `k8s/infrastructure/grafana.yaml`, datasource auto-provisioned
- [x] ELK Stack — JSON logs via `logback-spring.xml`, Logstash pipeline, `k8s/infrastructure/{elasticsearch,logstash,kibana}.yaml`
- [x] Jaeger — `k8s/infrastructure/jaeger.yaml`, OpenTelemetry in every service pom.xml

**Access URLs (after `kubectl port-forward`):**
| Tool | URL | Credentials |
|------|-----|-------------|
| Grafana | `http://grafana.shoeapp.local` | admin / admin |
| Kibana | `http://kibana.shoeapp.local` | — |
| Jaeger | `http://jaeger.shoeapp.local` | — |
| Eureka | `http://eureka.shoeapp.local` | — |

### Advanced Patterns
- [ ] Saga Pattern — orchestrate distributed order + payment + inventory transactions
- [ ] CQRS — separate read/write models in Order and Product services
- [ ] Circuit Breaker — Resilience4j on all Feign clients
- [ ] API Versioning — `/api/v1/` prefix on all routes

### Performance & Scale
- [ ] Redis caching on product-service reads (cache-aside pattern)
- [ ] CDN for product images (Cloudflare or AWS CloudFront)
- [ ] PostgreSQL read replicas for high-traffic services
- [ ] Kafka consumer groups for horizontal scaling of listeners

---

## Kafka Event Contracts

| Event Topic         | Published By      | Consumed By                        |
|---------------------|-------------------|------------------------------------|
| `order.created`     | order-service     | inventory-service, notification-service |
| `order.paid`        | payment-service   | order-service, notification-service |
| `order.cancelled`   | order-service     | inventory-service, notification-service |
| `order.status.updated` | order-service  | notification-service               |

---

## Security Rules

- Passwords: BCrypt hashing only
- JWT: access token 15 min, refresh token 7 days, stored in HttpOnly cookie
- All routes protected at API Gateway (except `/api/auth/**`)
- Admin routes (`POST/PUT/DELETE /products`, `PUT /orders/status`) require `ADMIN` role
- HTTPS only in production
- Kubernetes Secrets for all credentials (DB passwords, Stripe key, JWT secret)
- Input validation on all request bodies (`@Valid` + `@NotBlank`, etc.)
- Rate limiting at API Gateway (100 req/min per IP)
