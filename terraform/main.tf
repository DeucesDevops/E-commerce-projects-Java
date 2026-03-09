# ─────────────────────────────────────────────────────────
# Root module — wires all child modules together
#
# Apply order (Terraform handles this automatically via depends_on):
#   1. VPC          — networking foundation
#   2. EKS          — Kubernetes cluster in the VPC
#   3. RDS          — managed PostgreSQL databases
#   4. ElastiCache  — managed Redis for cart-service
#   5. MSK          — managed Kafka for event streaming
# ─────────────────────────────────────────────────────────

module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
}

module "eks" {
  source = "./modules/eks"

  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids

  cluster_version    = var.eks_cluster_version
  node_instance_type = var.eks_node_instance_type
  node_desired_size  = var.eks_node_desired_size
  node_min_size      = var.eks_node_min_size
  node_max_size      = var.eks_node_max_size

  depends_on = [module.vpc]
}

module "rds" {
  source = "./modules/rds"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  eks_sg_id          = module.eks.node_security_group_id

  instance_class     = var.rds_instance_class
  allocated_storage  = var.rds_allocated_storage
  postgres_version   = var.rds_postgres_version

  # One RDS instance per microservice (isolated failure domains)
  databases = [
    { name = "auth",      db_name = "auth_db",      username = "auth_user" },
    { name = "product",   db_name = "product_db",   username = "product_user" },
    { name = "order",     db_name = "order_db",     username = "order_user" },
    { name = "inventory", db_name = "inventory_db", username = "inventory_user" },
    { name = "payment",   db_name = "payment_db",   username = "payment_user" },
    { name = "user",      db_name = "user_db",      username = "user_user" },
  ]

  depends_on = [module.vpc, module.eks]
}

module "elasticache" {
  source = "./modules/elasticache"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  eks_sg_id          = module.eks.node_security_group_id

  node_type      = var.redis_node_type
  engine_version = var.redis_engine_version

  depends_on = [module.vpc, module.eks]
}

module "msk" {
  source = "./modules/msk"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  eks_sg_id          = module.eks.node_security_group_id

  instance_type  = var.msk_instance_type
  kafka_version  = var.msk_kafka_version
  broker_count   = var.msk_broker_count

  depends_on = [module.vpc, module.eks]
}

# ── Nginx Ingress Controller (installed via Helm into EKS) ───────────────────
resource "helm_release" "ingress_nginx" {
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  version          = "4.9.1"
  namespace        = "ingress-nginx"
  create_namespace = true

  set {
    name  = "controller.service.type"
    value = "LoadBalancer"
  }

  depends_on = [module.eks]
}

# ── cert-manager (installed via Helm into EKS) ───────────────────────────────
resource "helm_release" "cert_manager" {
  name             = "cert-manager"
  repository       = "https://charts.jetstack.io"
  chart            = "cert-manager"
  version          = "v1.14.4"
  namespace        = "cert-manager"
  create_namespace = true

  set {
    name  = "installCRDs"
    value = "true"
  }

  depends_on = [module.eks]
}
