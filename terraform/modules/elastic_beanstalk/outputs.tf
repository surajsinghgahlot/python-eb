output "application_name" {
  description = "Elastic Beanstalk application name"
  value       = aws_elastic_beanstalk_application.app.name
}

output "environment_name" {
  description = "Elastic Beanstalk environment name"
  value       = aws_elastic_beanstalk_environment.env.name
}

output "environment_endpoint" {
  description = "Elastic Beanstalk environment endpoint"
  value       = aws_elastic_beanstalk_environment.env.endpoint_url
}

output "environment_id" {
  description = "Elastic Beanstalk environment ID"
  value       = aws_elastic_beanstalk_environment.env.id
}
output "environment_arn" {
  description = "Elastic Beanstalk environment ARN"
  value       = aws_elastic_beanstalk_environment.env.arn
}

