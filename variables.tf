variable "aws_region" {
  description = "AWS region"
  type        = string
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

variable "codecommit_repository_name" {
  description = "CodeCommit repository name"
  type        = string
}

variable "branch_name" {
  description = "Branch name to monitor for CI/CD"
  type        = string
  default     = "main"
}




