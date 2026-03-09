# ─────────────────────────────────────────────────────────
# ElastiCache Module — managed Redis for cart-service
#
# Creates:
#   - Redis replication group (1 primary + 1 replica per AZ)
#   - Subnet group in private subnets
#   - Security group: only EKS nodes can connect on 6379
#   - Auth token stored in Secrets Manager
# ─────────────────────────────────────────────────────────

locals {
  prefix = "${var.project_name}-${var.environment}"
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "${local.prefix}-redis-subnet-group"
  subnet_ids = var.private_subnet_ids
}

resource "aws_security_group" "redis" {
  name        = "${local.prefix}-redis-sg"
  description = "Allow Redis access from EKS nodes only"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [var.eks_sg_id]
    description     = "Redis from EKS worker nodes"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.prefix}-redis-sg" }
}

resource "random_password" "redis_auth" {
  length  = 32
  special = false  # Redis AUTH token cannot contain special characters
}

resource "aws_secretsmanager_secret" "redis_auth" {
  name                    = "${local.prefix}/elasticache/redis/auth-token"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "redis_auth" {
  secret_id     = aws_secretsmanager_secret.redis_auth.id
  secret_string = random_password.redis_auth.result
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "${local.prefix}-redis"
  description          = "Redis cluster for ${var.project_name} cart-service"

  node_type            = var.node_type
  engine_version       = var.engine_version
  port                 = 6379

  # 1 primary + 1 read replica for HA
  num_cache_clusters   = 2
  automatic_failover_enabled = true
  multi_az_enabled     = true

  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]

  # TLS in-transit + auth token
  transit_encryption_enabled = true
  auth_token                 = random_password.redis_auth.result

  at_rest_encryption_enabled = true

  # Snap at low-traffic time
  snapshot_window          = "02:00-03:00"
  snapshot_retention_limit = 3

  tags = { Name = "${local.prefix}-redis" }
}
