output "endpoints" {
  description = "Map of service name → RDS endpoint address"
  value = {
    for name, instance in aws_db_instance.main :
    name => "${instance.address}:${instance.port}"
  }
}

output "secret_arns" {
  description = "Map of service name → Secrets Manager ARN holding the DB password"
  value = {
    for name, secret in aws_secretsmanager_secret.db_password :
    name => secret.arn
  }
}
