# How This Project Works — A DevOps Walkthrough

> This document explains the full journey of code in this project — from the moment
> you type it on your laptop to the moment a real user sees it running in the cloud.
> Written for someone new to DevOps.

---

## The Big Picture

Imagine a factory production line. Raw materials go in one end, a finished product comes out the other.
DevOps is the same idea, but for software:

```
You write code  →  It gets tested  →  It gets packaged  →  It gets deployed  →  You monitor it
```

Every step is automated. You push code to GitHub, and the rest happens on its own.
That is the goal of this entire setup.

---

## The 6 Layers of This Project

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 6 — MONITORING     Prometheus + Grafana + Alertmanager   │
│  "Is everything healthy in production?"                         │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 5 — KUBERNETES     EKS (AWS)                             │
│  "The platform that runs your app in the cloud"                 │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 4 — GITOPS (CD)    ArgoCD                                │
│  "Automatically deploys your app when the code changes"         │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3 — CI/CD PIPELINE GitHub Actions                        │
│  "Tests, scans, and packages your code automatically"           │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2 — CONTAINERS     Docker                                │
│  "Packages your app so it runs the same everywhere"             │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1 — INFRASTRUCTURE Terraform                             │
│  "Creates the cloud servers your app lives on"                  │
└─────────────────────────────────────────────────────────────────┘
```

Let's walk through each layer, starting from the bottom.

---

## Layer 1 — Infrastructure (Terraform)

**In plain English:** Before your app can run anywhere, you need actual computers (servers)
in the cloud. Terraform creates those servers for you by reading a config file.

**The analogy:** Terraform is like an architect's blueprint. Instead of drawing a building by hand,
you describe it in a file and the building company (AWS) builds it for you automatically.

**What Terraform creates for this project:**

```
AWS Cloud
│
├── VPC (Virtual Private Cloud)
│     A private network in AWS — like your own section of the internet.
│     Your services talk to each other here, hidden from the public.
│
├── EKS Cluster (Elastic Kubernetes Service)
│     A group of servers that will run your app.
│     Think of it as a managed computer farm.
│
├── RDS (Relational Database Service)
│     6 separate PostgreSQL databases — one per service.
│     AWS manages backups, patches, and availability for you.
│
├── ElastiCache (Redis)
│     A managed Redis instance for the cart service.
│     Redis is like a super-fast notepad in memory — great for shopping carts.
│
└── MSK (Managed Kafka)
      A managed Kafka cluster for event streaming between services.
      When an order is placed, Kafka broadcasts the news to inventory, payment,
      and notification services simultaneously.
```

**The files:**
```
terraform/
├── versions.tf         ← defines which tools/versions to use, and where to store state
├── main.tf             ← wires all the modules together
├── variables.tf        ← the inputs (region, instance sizes, etc.)
├── outputs.tf          ← the results (cluster URL, database endpoints, etc.)
└── modules/
    ├── vpc/            ← networking blueprint
    ├── eks/            ← Kubernetes cluster blueprint
    ├── rds/            ← database blueprint
    ├── elasticache/    ← Redis blueprint
    └── msk/            ← Kafka blueprint
```

**How to use it:**
```bash
terraform init      # downloads the AWS tools needed
terraform plan      # shows you what it WILL create (preview only, nothing happens yet)
terraform apply     # actually creates everything in AWS (~10 minutes)
terraform destroy   # tears it all down (billing stops)
```

> **Important:** The state file (which tracks what Terraform created) is stored in an
> S3 bucket on AWS, not on your laptop. This means multiple people can use Terraform
> on the same project without conflicts, and you never lose track of what exists.

---

## Layer 2 — Containers (Docker)

**In plain English:** Your app needs to be packaged before it can be shipped anywhere.
Docker packs your code, its dependencies, and its runtime into a single portable box called an **image**.

**The analogy:** A Docker image is like a shipping container. It doesn't matter if the ship is
going to New York or Tokyo — the container looks the same and opens the same way.
Your app works identically on your laptop, in CI, and in production.

**This project has 11 Docker images:**

| Image | What it contains |
|---|---|
| `auth-service` | Java app that handles login, register, JWT tokens |
| `api-gateway` | Java app that routes all incoming requests to the right service |
| `product-service` | Java app that manages the shoe catalogue |
| `inventory-service` | Java app that tracks stock levels |
| `order-service` | Java app that manages customer orders |
| `cart-service` | Java app that manages shopping carts (uses Redis) |
| `payment-service` | Java app that handles Stripe payments |
| `user-service` | Java app that manages user profiles |
| `notification-service` | Java app that sends order confirmation emails |
| `discovery-server` | Java app that lets services find each other (Eureka) |
| `frontend` | React app served by Nginx |

**What a Dockerfile looks like (simplified):**
```dockerfile
# Start from an official Java 17 image (the base layer)
FROM eclipse-temurin:17-jdk AS build

# Copy your source code in
COPY . .

# Build the JAR file
RUN mvn package

# --- Switch to a smaller image for running (not building) ---
FROM eclipse-temurin:17-jre

# Copy only the JAR from the build stage (multi-stage build)
COPY --from=build target/app.jar app.jar

# Start the app
ENTRYPOINT ["java", "-jar", "app.jar"]
```

> **Multi-stage build:** The first stage compiles the code (needs the full JDK).
> The second stage only runs it (needs only the JRE — much smaller).
> The final image is leaner and has fewer security vulnerabilities.

**Where images are stored:** After being built, images are pushed to
**GHCR (GitHub Container Registry)** — GitHub's own image storage, built into your account.
Images are named like: `ghcr.io/bernardboateng/auth-service:a3f9c12`
The `a3f9c12` at the end is the exact Git commit that produced that image.

---

## Layer 3 — CI/CD Pipeline (GitHub Actions)

**In plain English:** CI/CD stands for **Continuous Integration / Continuous Delivery**.
Every time you push code to GitHub, a set of automated jobs runs to check, build, scan,
and eventually deploy your code — without you having to do anything manually.

**The analogy:** Think of it like a security checkpoint at an airport.
Your code goes through multiple checks before it's allowed to "board the plane" (get deployed).
If any check fails, the code is held back.

### What triggers the pipeline?

```
You push code to the main branch on GitHub
           │
           ▼
GitHub sees the push and starts the pipeline automatically
```

### The 4 stages of the CI/CD pipeline

```
PUSH TO MAIN
     │
     ▼
┌──────────────────────────────────────────────────┐
│ STAGE 1: TEST                                    │
│ Runs Maven tests for all 10 services in parallel │
│ If any test fails → pipeline stops here          │
│ Nothing gets built. Nothing gets deployed.       │
└──────────────────────────┬───────────────────────┘
                           │ (all tests pass)
                           ▼
┌──────────────────────────────────────────────────┐
│ STAGE 2: BUILD & PUSH                            │
│ Builds Docker images for all 11 services         │
│ Pushes them to GHCR tagged with the Git SHA      │
│ e.g. ghcr.io/bernardboateng/auth-service:a3f9c12 │
└──────────────────────────┬───────────────────────┘
                           │ (all images built)
                           ▼
┌──────────────────────────────────────────────────┐
│ STAGE 3: TRIVY SECURITY SCAN                     │
│ Scans every image for known CVEs (vulnerabilities│
│ in dependencies or the OS inside the container)  │
│ If CRITICAL or HIGH severity found → stops here  │
│ You are NOT allowed to ship insecure code        │
└──────────────────────────┬───────────────────────┘
                           │ (no critical vulnerabilities)
                           ▼
┌──────────────────────────────────────────────────┐
│ STAGE 4: UPDATE IMAGE TAGS (GitOps)              │
│ Updates the image tag in every deployment file   │
│ Commits that change back to GitHub               │
│ ArgoCD (Layer 4) detects the commit and deploys  │
└──────────────────────────────────────────────────┘
```

### Pull Request checks (separate workflow)

When you open a Pull Request (before merging to main), a lighter workflow runs:

```
Open a Pull Request
        │
        ▼
- Run all Maven tests
- Build all JARs (confirm the code compiles)
- ESLint the frontend (catch JS/TS errors)
- TypeScript type-check the frontend
- Build the frontend (confirm npm run build works)
```

This gives you fast feedback before you merge — you catch broken code in your branch,
not after it reaches main.

**The files:**
```
.github/
└── workflows/
    ├── ci-cd.yml       ← runs on push to main (full 4-stage pipeline)
    └── pr-checks.yml   ← runs on pull requests (test & build only)
```

---

## Layer 4 — GitOps Deployment (ArgoCD)

**In plain English:** ArgoCD watches your Git repository.
The moment it detects a change in the `k8s/` folder, it automatically applies that change
to the Kubernetes cluster. No manual `kubectl apply` commands needed.

**The analogy:** ArgoCD is like a very attentive employee who watches a whiteboard (your Git repo).
The moment you change anything on the whiteboard, they immediately go update the real thing
(the running cluster) to match.

### The GitOps principle

> **Git is the single source of truth.**
>
> The cluster should always match exactly what is written in Git.
> If someone manually changes something in the cluster, ArgoCD reverts it.
> The only way to change production is to change the code in Git.

### How the full deployment flow works

```
Stage 4 of CI/CD updates this line in auth-service/deployment.yaml:
  image: ghcr.io/bernardboateng/auth-service:a3f9c12
             changes to ↓
  image: ghcr.io/bernardboateng/auth-service:b7e1f45
                        │
                        │ (git commit + push)
                        ▼
           ArgoCD is watching the k8s/ folder
           It detects the new commit within ~3 minutes
                        │
                        ▼
           ArgoCD pulls the new deployment.yaml
           Tells Kubernetes: "update auth-service to use image b7e1f45"
                        │
                        ▼
           Kubernetes performs a rolling update:
           - Starts a new auth-service pod with the new image
           - Waits for the new pod to pass its health check
           - Only then shuts down the old pod
           - Zero downtime
```

### Key ArgoCD settings in this project

| Setting | What it does |
|---|---|
| `automated.selfHeal: true` | If someone manually changes the cluster, ArgoCD reverts it back to what Git says |
| `automated.prune: true` | If you delete a file from `k8s/`, ArgoCD deletes the matching resource from the cluster |
| `ignoreDifferences on replicas` | The HPA (auto-scaler) controls replica count at runtime — ArgoCD won't override it |

**The files:**
```
argocd/
└── application.yaml    ← tells ArgoCD: watch this repo, deploy to this cluster
```

---

## Layer 5 — Kubernetes (EKS)

**In plain English:** Kubernetes is the platform that actually runs your containers.
Think of it as an operating system for your cloud — it decides which server runs which container,
restarts crashed containers, scales up when traffic is high, and scales down when it's quiet.

**The analogy:** Kubernetes is like a restaurant manager.
The manager (Kubernetes) decides which chef (server) cooks which dish (container),
makes sure every dish gets made, replaces a chef who calls in sick, and hires extra
chefs on a busy Friday night.

### What lives in Kubernetes for this project

**For each of the 11 services:**

```
k8s/services/auth-service/
├── deployment.yaml   ← "run 2 copies of this container image"
├── service.yaml      ← "give this container a stable network address"
├── configmap.yaml    ← "inject these environment variables (non-secret)"
└── hpa.yaml          ← "auto-scale between 2-5 copies based on CPU usage"
```

**Shared infrastructure:**

```
k8s/infrastructure/
├── namespace.yaml        ← creates the "shoeapp" isolated space in the cluster
├── ingress.yaml          ← one public entry point — routes traffic to the right service
├── cert-manager.yaml     ← automatically gets and renews TLS (HTTPS) certificates
├── shared-secrets.yaml   ← JWT secret, Stripe key (encrypted, not plain text)
├── postgres-*.yaml       ← one database deployment per service (6 total)
├── redis.yaml            ← shopping cart storage
├── kafka.yaml            ← event bus for service-to-service communication
├── prometheus.yaml       ← metrics collection
├── grafana.yaml          ← metrics dashboards
├── alertmanager.yaml     ← alert routing (Slack notifications)
├── elasticsearch.yaml    ← log storage
├── logstash.yaml         ← log processing pipeline
├── kibana.yaml           ← log search and exploration
└── jaeger.yaml           ← distributed tracing (follows a request across all services)
```

### Key Kubernetes concepts used here

**Deployment** — describes the desired state: "I want 2 copies of auth-service running at all times."
Kubernetes ensures that is always true.

**Service** — gives a container a stable internal address.
Without this, every time a pod restarts it gets a new IP address.
With a Service, other pods always reach it at `http://auth-service:8084`.

**HPA (Horizontal Pod Autoscaler)** — watches CPU usage.
If auth-service gets busy (CPU > 70%), it automatically spins up more copies.
When traffic drops, it scales back down to save money.

**Health Probes** — Kubernetes checks each container's `/actuator/health` endpoint every 10 seconds.
If a container stops responding, Kubernetes kills it and starts a fresh one.
This is why the app can self-heal from crashes.

**Secrets** — sensitive values (database passwords, JWT secret, Stripe key) are stored
as Kubernetes Secrets — encrypted at rest, injected into containers as environment variables.
They never appear in plain text in any file that gets committed to Git.

---

## Layer 6 — Monitoring (Prometheus + Grafana + Alertmanager)

**In plain English:** Once your app is running, you need to know if it's healthy.
Is it slow? Are requests failing? Is a service about to run out of memory?
The monitoring stack answers all of these questions in real time.

**The analogy:** This is the dashboard in your car — speed, fuel, engine temperature.
Without it, you're driving blind. With it, you know exactly what's happening and get warned
before something breaks.

### The 3 tools and how they work together

```
Every Spring Boot service exposes a /actuator/prometheus endpoint
(a page full of numbers describing everything about the service)
                    │
                    │  every 15 seconds
                    ▼
             PROMETHEUS
  Collects and stores all those numbers over time.
  Also evaluates alerting rules: "if error rate > 5%, fire an alert"
                    │                        │
           queries  │              fires to  │
                    ▼                        ▼
              GRAFANA                  ALERTMANAGER
  Turns the numbers              Routes the alert to Slack.
  into visual dashboards.        Deduplicates and groups alerts
  2 dashboards pre-built:        so you don't get spammed.
  - Services Overview
  - JVM Overview
```

### What the dashboards show

**Services Overview dashboard:**
- HTTP request rate per service (how many requests per second?)
- HTTP error rate per service (what % of requests are failing?)
- p95 response time (how long does the slowest 5% of requests take?)
- Services up/down status (green = healthy, red = down)

**JVM Overview dashboard:**
- Heap memory used per service (how much RAM is each Java process using?)
- Heap usage % (is any service about to run out of memory?)
- GC pause time (how often is Java stopping to clean up memory?)
- Live thread count (how many things is each service doing at once?)

### The 5 alerting rules

| Alert | Fires when | Severity |
|---|---|---|
| `ServiceDown` | A service has been unreachable for 2+ minutes | Critical |
| `HighRestartRate` | A pod has restarted more than once in 15 minutes | Warning |
| `HighErrorRate` | More than 5% of requests are returning 5xx errors | Critical |
| `HighResponseTime` | p95 latency is above 2 seconds | Warning |
| `HighJvmHeapUsage` | A service's heap is above 85% full | Warning |

When any of these fire, a message is sent to the `#shoeapp-alerts` Slack channel automatically.

---

## Putting It All Together — One Complete Flow

Here is the entire journey from "I wrote a bug fix" to "it's live in production":

```
1. You fix a bug in auth-service on your laptop
   └─ You test it locally with docker-compose up

2. You push the code to GitHub
   git push origin main

3. GitHub Actions starts automatically (ci-cd.yml)
   ├─ Runs all Maven tests (10 services in parallel) — ~3 minutes
   ├─ Builds 11 Docker images, pushes to GHCR — ~5 minutes
   ├─ Scans all 11 images for vulnerabilities (Trivy) — ~3 minutes
   └─ Updates image tags in k8s/services/auth-service/deployment.yaml
      Commits: "chore: update image tags to b7e1f45 [skip ci]"

4. ArgoCD detects the new commit to k8s/
   └─ Syncs the cluster to match Git

5. Kubernetes performs a rolling update
   ├─ Starts a new auth-service pod with image b7e1f45
   ├─ Waits for /actuator/health to return 200 OK
   ├─ Only then terminates the old pod
   └─ Zero downtime for users

6. Prometheus scrapes the new pod's /actuator/prometheus every 15 seconds
   └─ Grafana dashboards update in real time

7. If anything goes wrong (error rate spikes, pod crashes):
   └─ Alertmanager sends a message to #shoeapp-alerts on Slack

Total time from git push to live in production: ~12–15 minutes, fully automated.
```

---

## Local Development vs Production

| | Local (your laptop) | Production (AWS) |
|---|---|---|
| **How to run** | `docker-compose up` | Kubernetes on EKS |
| **Databases** | Docker containers (postgres/redis/kafka) | Managed AWS RDS / ElastiCache / MSK |
| **Access** | `localhost:8080` | `https://shoeapp.yourdomain.com` |
| **TLS (HTTPS)** | No | Yes — cert-manager + Let's Encrypt |
| **Scaling** | Fixed (1 copy of each service) | Automatic (HPA scales 2–5 copies) |
| **Monitoring** | None | Prometheus + Grafana + Alertmanager |
| **Deployment** | Manual (`docker-compose up`) | Automatic (GitHub Actions + ArgoCD) |

---

## Glossary

| Term | Plain English explanation |
|---|---|
| **CI (Continuous Integration)** | Every code change is automatically tested before it can be merged |
| **CD (Continuous Delivery)** | Every code change that passes tests is automatically deployed |
| **Container** | A packaged, portable box containing your app and everything it needs to run |
| **Docker image** | The blueprint for a container — like a class in OOP |
| **Docker container** | A running instance of an image — like an object in OOP |
| **Kubernetes** | A platform that runs and manages containers at scale |
| **Pod** | The smallest unit in Kubernetes — one or more containers running together |
| **Deployment** | A Kubernetes object that keeps N copies of a pod running |
| **Service** | A stable network address for a group of pods |
| **HPA** | Horizontal Pod Autoscaler — adds/removes pods based on CPU/memory |
| **Ingress** | A single entry point that routes external traffic to the right service |
| **GitOps** | Using Git as the single source of truth for what should be running in production |
| **ArgoCD** | A GitOps tool — watches Git and keeps the cluster in sync with it |
| **Terraform** | A tool that creates cloud infrastructure by reading config files |
| **Prometheus** | A tool that collects and stores metrics (numbers) from your services |
| **Grafana** | A tool that turns Prometheus metrics into visual dashboards |
| **Alertmanager** | Routes Prometheus alerts to Slack, email, or PagerDuty |
| **Trivy** | A security scanner that checks Docker images for known vulnerabilities |
| **CVE** | Common Vulnerability and Exposure — a known security flaw in a piece of software |
| **GHCR** | GitHub Container Registry — GitHub's built-in storage for Docker images |
| **Rolling update** | Updating a service one pod at a time so there is zero downtime |
| **Health probe** | Kubernetes periodically checks if a container is alive and ready |
| **Secret** | A Kubernetes object that stores sensitive values (passwords, API keys) encrypted |
| **Namespace** | An isolated section within a Kubernetes cluster — like a folder for resources |
