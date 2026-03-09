# ─────────────────────────────────────────────────────────
# MSK Module — Amazon Managed Streaming for Apache Kafka
#
# Creates:
#   - MSK cluster with TLS encryption in transit + at rest
#   - Security group: only EKS nodes can reach brokers on 9094 (TLS)
#   - CloudWatch log group for broker logs
#
# Topics used by the application:
#   - order-placed       (order-service → inventory-service, notification-service)
#   - payment-completed  (payment-service → order-service, notification-service)
#   - inventory-updated  (inventory-service → notification-service)
# ─────────────────────────────────────────────────────────

locals {
  prefix = "${var.project_name}-${var.environment}"
}

resource "aws_security_group" "msk" {
  name        = "${local.prefix}-msk-sg"
  description = "Allow Kafka TLS access from EKS nodes only"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 9094
    to_port         = 9094
    protocol        = "tcp"
    security_groups = [var.eks_sg_id]
    description     = "Kafka TLS from EKS worker nodes"
  }

  # Zookeeper (used internally by MSK — restrict to within the MSK SG)
  ingress {
    from_port = 2181
    to_port   = 2181
    protocol  = "tcp"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.prefix}-msk-sg" }
}

resource "aws_cloudwatch_log_group" "msk_broker" {
  name              = "/aws/msk/${local.prefix}/broker"
  retention_in_days = 7
}

resource "aws_msk_cluster" "main" {
  cluster_name           = "${local.prefix}-kafka"
  kafka_version          = var.kafka_version
  number_of_broker_nodes = var.broker_count

  broker_node_group_info {
    instance_type   = var.instance_type
    client_subnets  = var.private_subnet_ids
    security_groups = [aws_security_group.msk.id]

    storage_info {
      ebs_storage_info {
        volume_size = 50
      }
    }
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  # SASL/SCRAM authentication for client connections
  client_authentication {
    sasl {
      scram = true
    }
  }

  configuration_info {
    arn      = aws_msk_configuration.main.arn
    revision = aws_msk_configuration.main.latest_revision
  }

  broker_logs {
    cloudwatch_logs {
      enabled   = true
      log_group = aws_cloudwatch_log_group.msk_broker.name
    }
  }

  tags = { Name = "${local.prefix}-kafka" }
}

resource "aws_msk_configuration" "main" {
  name           = "${local.prefix}-kafka-config"
  kafka_versions = [var.kafka_version]

  server_properties = <<-PROPS
    auto.create.topics.enable=false
    default.replication.factor=3
    min.insync.replicas=2
    num.partitions=3
    log.retention.hours=168
    PROPS
}
