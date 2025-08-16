variable "environment" {
  description = "Environment name"
  type        = string
}

variable "application_name" {
  description = "Name of the application"
  type        = string
}

variable "aws_region" {
  description = "AWS region for the Elastic Beanstalk application"
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