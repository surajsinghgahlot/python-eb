variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "app_port" {
  description = "Application port for the Elastic Beanstalk environment"
  type        = string
}

variable "inbound_ports" {
  description = "List of inbound ports to allow on load balancer"
  type        = list(number)
  default     = [80, 443]
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "application_name" {
  description = "Application name"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "secret_arn" {
  description = "AWS secret manager arn"
  type        = string
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
}

variable "solution_stack_name" {
  description = "Elastic Beanstalk solution stack name"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "min_size" {
  description = "Minimum number of instances"
  type        = string
}

variable "max_size" {
  description = "Maximum number of instances"
  type        = string
}

variable "key_pair_name" {
  description = "EC2 key pair name"
  type        = string
  default     = ""
}

variable "github_owner" {
  description = "GitHub repository owner"
  type        = string
}

variable "github_repository" {
  description = "GitHub repository name"
  type        = string
}

variable "github_branch" {
  description = "GitHub branch name to monitor for CI/CD"
  type        = string
  default     = "main"
}

variable "github_oauth_token" {
  description = "GitHub OAuth token for CodePipeline"
  type        = string
}

# Email configuration variables
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