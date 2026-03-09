output "primary_endpoint" {
  description = "Redis primary endpoint (host:port)"
  value       = "${aws_elasticache_replication_group.main.primary_endpoint_address}:6379"
}

output "auth_secret_arn" {
  description = "Secrets Manager ARN for the Redis AUTH token"
  value       = aws_secretsmanager_secret.redis_auth.arn
}
