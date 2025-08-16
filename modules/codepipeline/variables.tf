variable "environment" {
  description = "Environment name"
  type        = string
}

variable "application_name" {
  description = "Application name"
  type        = string
}

variable "codecommit_repository_name" {
  description = "CodeCommit repository name"
  type        = string
}

variable "branch_name" {
  description = "Branch name to monitor"
  type        = string
  default     = "main"
}

variable "codebuild_service_role_arn" {
  description = "CodeBuild service role ARN"
  type        = string
}

variable "codepipeline_service_role_arn" {
  description = "CodePipeline service role ARN"
  type        = string
}

variable "elastic_beanstalk_application_name" {
  description = "Elastic Beanstalk application name"
  type        = string
}

variable "elastic_beanstalk_environment_name" {
  description = "Elastic Beanstalk environment name"
  type        = string
}
