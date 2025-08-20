# S3 Bucket for CodePipeline artifacts
resource "aws_s3_bucket" "artifact_store" {
  bucket = "${var.environment}-${var.application_name}-pipeline-artifacts"

  tags = {
    Name        = "${var.environment}-${var.application_name}-pipeline-artifacts"
    Environment = var.environment
  }
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "artifact_store" {
  bucket = aws_s3_bucket.artifact_store.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "artifact_store" {
  bucket = aws_s3_bucket.artifact_store.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CodePipeline
resource "aws_codepipeline" "pipeline" {
  name     = "${var.environment}-${var.application_name}-pipeline"
  role_arn = var.codepipeline_service_role_arn

  artifact_store {
    location = aws_s3_bucket.artifact_store.bucket
    type     = "S3"
  }

  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "ThirdParty"
      provider         = "GitHub"
      version          = "1"
      output_artifacts = ["source_output"]

      configuration = {
        Owner                = var.github_owner
        Repo                 = var.github_repository
        Branch               = var.github_branch
        PollForSourceChanges = "true"
        OAuthToken           = var.github_oauth_token
      }
    }
  }

  stage {
    name = "Deploy"

    action {
      name            = "Deploy"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "ElasticBeanstalk"
      input_artifacts = ["source_output"]
      version         = "1"

      configuration = {
        ApplicationName = var.elastic_beanstalk_application_name
        EnvironmentName = var.elastic_beanstalk_environment_name
      }
    }
  }

  tags = {
    Name        = "${var.environment}-${var.application_name}-pipeline"
    Environment = var.environment
  }
}