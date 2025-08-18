variable "environment" {
  description = "Environment name"
  type        = string
}

variable "application_name" {
  description = "Application name"
  type        = string
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
  description = "GitHub branch name to monitor"
  type        = string
  default     = "main"
}

variable "github_oauth_token" {
  description = "GitHub OAuth token for CodePipeline"
  type        = string
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
