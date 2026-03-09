# ─────────────────────────────────────────────────────────
# RDS Module — one PostgreSQL instance per microservice
#
# Each instance is:
#   - Multi-AZ for automatic failover
#   - In private subnets (no public access)
#   - Accessible only from EKS worker nodes
#   - Encrypted at rest with AWS-managed key
#
# Passwords are auto-generated and stored in AWS Secrets Manager.
# The Kubernetes secret values must be populated from SSM/Secrets Manager
# after terraform apply — see outputs.rds_secret_arns.
# ─────────────────────────────────────────────────────────

locals {
  prefix = "${var.project_name}-${var.environment}"
}

# ── Subnet group shared by all RDS instances ──────────────
resource "aws_db_subnet_group" "main" {
  name       = "${local.prefix}-rds-subnet-group"
  subnet_ids = var.private_subnet_ids
  tags       = { Name = "${local.prefix}-rds-subnet-group" }
}

# ── Security group: only EKS nodes can reach RDS ─────────
resource "aws_security_group" "rds" {
  name        = "${local.prefix}-rds-sg"
  description = "Allow PostgreSQL access from EKS nodes only"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.eks_sg_id]
    description     = "PostgreSQL from EKS worker nodes"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.prefix}-rds-sg" }
}

# ── Random passwords for each database ───────────────────
resource "random_password" "db_password" {
  for_each = { for db in var.databases : db.name => db }

  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# ── Store each password in AWS Secrets Manager ────────────
resource "aws_secretsmanager_secret" "db_password" {
  for_each = { for db in var.databases : db.name => db }

  name                    = "${local.prefix}/rds/${each.key}/password"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "db_password" {
  for_each = { for db in var.databases : db.name => db }

  secret_id     = aws_secretsmanager_secret.db_password[each.key].id
  secret_string = random_password.db_password[each.key].result
}

# ── RDS instances ─────────────────────────────────────────
resource "aws_db_instance" "main" {
  for_each = { for db in var.databases : db.name => db }

  identifier        = "${local.prefix}-${each.key}-db"
  engine            = "postgres"
  engine_version    = var.postgres_version
  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage

  db_name  = each.value.db_name
  username = each.value.username
  password = random_password.db_password[each.key].result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az               = true
  publicly_accessible    = false
  storage_encrypted      = true
  deletion_protection    = true
  skip_final_snapshot    = false
  final_snapshot_identifier = "${local.prefix}-${each.key}-final-snapshot"

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  tags = { Name = "${local.prefix}-${each.key}-db" }
}
