variable "project_name"       { type = string }
variable "environment"         { type = string }
variable "vpc_id"              { type = string }
variable "private_subnet_ids"  { type = list(string) }
variable "eks_sg_id"           { type = string }
variable "instance_class"      { type = string }
variable "allocated_storage"   { type = number }
variable "postgres_version"    { type = string }

variable "databases" {
  description = "List of databases to create — each gets its own RDS instance"
  type = list(object({
    name     = string
    db_name  = string
    username = string
  }))
}
