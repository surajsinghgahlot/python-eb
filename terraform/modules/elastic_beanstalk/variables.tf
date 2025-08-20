variable "environment" {
  description = "Environment name"
  type        = string
}

variable "application_name" {
  description = "Name of the application"
  type        = string
}

variable "app_port" {
  description = "Application port for the Elastic Beanstalk environment"
  type        = string
}

variable "solution_stack_name" {
  description = "Elastic Beanstalk solution stack name"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for Elastic Beanstalk"
  type        = string
}

variable "min_size" {
  description = "Minimum number of instances"
  type        = number
}

variable "max_size" {
  description = "Maximum number of instances"
  type        = number
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnets" {
  description = "Private subnet IDs"
  type        = list(string)
}

variable "public_subnets" {
  description = "Public subnet IDs"
  type        = list(string)
}

variable "key_pair_name" {
  description = "Name of the EC2 key pair"
  type        = string
  default     = ""
}

variable "iam_instance_profile" {
  description = "IAM instance profile name"
  type        = string
}

variable "iam_service_role" {
  description = "IAM service role name"
  type        = string
}

variable "elastic_beanstalk_security_group_id" {
  description = "Security Group ID for Elastic Beanstalk instances"
  type        = string
}

variable "load_balancer_security_group_id" {
  description = "Security Group ID for Load Balancer"
  type        = string
}

# Env configuration variables
variable "email_smtp_host" {
  description = "SMTP host for email sending"
  type        = string
}

variable "mail_service" {
  description = "Mail service provider"
  type        = string
}

variable "email_smtp_port" {
  description = "SMTP port for email sending"
  type        = string
}

variable "email_smtp_username" {
  description = "SMTP username for email sending"
  type        = string
}

variable "email_smtp_password" {
  description = "SMTP password for email sending"
  type        = string
}

variable "email_smtp_secure" {
  description = "SMTP secure connection (true for 465, false for other ports)"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_host" {
  description = "Database host"
  type        = string
}

variable "db_port" {
  description = "Database port"
  type        = string
}

variable "access_token_secret" {
  description = "JWT access token secret"
  type        = string
}

variable "access_token_timeout_duration" {
  description = "JWT access token timeout duration"
  type        = string
}

variable "refresh_token_secret" {
  description = "JWT refresh token secret"
  type        = string
}

variable "refresh_token_timeout_duration" {
  description = "JWT refresh token timeout duration"
  type        = string
}

variable "vendor_secret" {
  description = "Vendor secret key"
  type        = string
}

variable "crypto_secret_key" {
  description = "Crypto secret key"
  type        = string
}

variable "bucket_s3_zone" {
  description = "S3 bucket zone"
  type        = string
}

variable "bucket_secret_access_key" {
  description = "S3 bucket secret access key"
  type        = string
}

variable "bucket_access_key_id" {
  description = "S3 bucket access key ID"
  type        = string
}

variable "s3_image_bucket" {
  description = "S3 image bucket name"
  type        = string
}