output "pipeline_name" {
  description = "CodePipeline name"
  value       = aws_codepipeline.pipeline.name
}

output "pipeline_arn" {
  description = "CodePipeline ARN"
  value       = aws_codepipeline.pipeline.arn
}

output "build_project_name" {
  description = "CodeBuild project name"
  value       = aws_codebuild_project.build.name
}

output "artifact_bucket_name" {
  description = "S3 bucket name for artifacts"
  value       = aws_s3_bucket.artifact_store.bucket
}
