# S3 Bucket for CodePipeline artifacts
resource "aws_s3_bucket" "artifact_store" {
  bucket = "${var.environment}-${var.application_name}-pipeline-artifacts"

  tags = {
    Name        = "${var.environment}-${var.application_name}-pipeline-artifacts"
    Environment = var.environment
  }
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

# CodeBuild Project
resource "aws_codebuild_project" "build" {
  name          = "${var.environment}-${var.application_name}-build"
  description   = "Build project for ${var.application_name}"
  build_timeout = "10"
  service_role  = var.codebuild_service_role_arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/amazonlinux2-x86_64-standard:4.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = true

    environment_variable {
      name  = "ENVIRONMENT"
      value = var.environment
    }

    environment_variable {
      name  = "APPLICATION_NAME"
      value = var.application_name
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = file("${path.module}/buildspec.yml")
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/aws/codebuild/${var.environment}-${var.application_name}"
      stream_name = "build-log"
    }
  }

  tags = {
    Name        = "${var.environment}-${var.application_name}-build"
    Environment = var.environment
  }
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
    name = "Build"

    action {
      name            = "Build"
      category        = "Build"
      owner           = "AWS"
      provider        = "CodeBuild"
      input_artifacts = ["source_output"]
      version         = "1"

      configuration = {
        ProjectName = aws_codebuild_project.build.name
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
