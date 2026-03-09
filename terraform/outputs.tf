output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "EKS cluster name — use with: aws eks update-kubeconfig --name <value>"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS API server endpoint"
  value       = module.eks.cluster_endpoint
}

output "rds_endpoints" {
  description = "Map of service name → RDS endpoint (host:port)"
  value       = module.rds.endpoints
  sensitive   = false
}

output "redis_endpoint" {
  description = "ElastiCache Redis primary endpoint"
  value       = module.elasticache.primary_endpoint
}

output "kafka_bootstrap_brokers" {
  description = "MSK Kafka bootstrap broker string (TLS)"
  value       = module.msk.bootstrap_brokers_tls
}
