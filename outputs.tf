# Elastic Beanstalk Outputs
output "elastic_beanstalk_environment_endpoint" {
  description = "Elastic Beanstalk environment endpoint"
  value       = module.elastic_beanstalk.environment_endpoint
}

output "elastic_beanstalk_application_name" {
  description = "Elastic Beanstalk application name"
  value       = module.elastic_beanstalk.application_name
}

# CodePipeline Outputs
output "codepipeline_name" {
  description = "CodePipeline name"
  value       = module.codepipeline.pipeline_name
}

output "codepipeline_arn" {
  description = "CodePipeline ARN"
  value       = module.codepipeline.pipeline_arn
}

output "build_project_name" {
  description = "CodeBuild project name"
  value       = module.codepipeline.build_project_name
}

output "artifact_bucket_name" {
  description = "S3 bucket name for pipeline artifacts"
  value       = module.codepipeline.artifact_bucket_name
}