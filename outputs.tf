# Elastic Beanstalk Outputs
output "elastic_beanstalk_environment_endpoint" {
  description = "Elastic Beanstalk environment endpoint"
  value       = module.elastic_beanstalk.environment_endpoint
}

output "elastic_beanstalk_application_name" {
  description = "Elastic Beanstalk application name"
  value       = module.elastic_beanstalk.application_name
}