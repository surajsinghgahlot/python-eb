output "beanstalk_service_role_name" {
  description = "Elastic Beanstalk service role name"
  value       = aws_iam_role.beanstalk_service_role.name
}

output "beanstalk_service_role_arn" {
  description = "Elastic Beanstalk service role ARN"
  value       = aws_iam_role.beanstalk_service_role.arn
}

output "beanstalk_instance_profile_name" {
  description = "Elastic Beanstalk instance profile name"
  value       = aws_iam_instance_profile.beanstalk_instance_profile.name
}

output "beanstalk_instance_role_arn" {
  description = "Elastic Beanstalk instance role ARN"
  value       = aws_iam_role.beanstalk_instance_role.arn
}

output "codebuild_service_role_arn" {
  description = "CodeBuild service role ARN"
  value       = aws_iam_role.codebuild_service_role.arn
}

output "codepipeline_service_role_arn" {
  description = "CodePipeline service role ARN"
  value       = aws_iam_role.codepipeline_service_role.arn
}

