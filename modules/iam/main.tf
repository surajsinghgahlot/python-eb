# =========================
# Elastic Beanstalk Service Role
# =========================
resource "aws_iam_role" "beanstalk_service_role" {
  name = "${var.environment}-beanstalk-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "elasticbeanstalk.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.environment}-beanstalk-service-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "beanstalk_service_role_policy" {
  role       = aws_iam_role.beanstalk_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkService"
}

# =========================
# Elastic Beanstalk Instance Profile Role
# =========================
resource "aws_iam_role" "beanstalk_instance_role" {
  name = "${var.environment}-beanstalk-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.environment}-beanstalk-instance-role"
    Environment = var.environment
  }
}

# Default Beanstalk managed policies
resource "aws_iam_role_policy_attachment" "beanstalk_instance_role_policy" {
  role       = aws_iam_role.beanstalk_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy_attachment" "beanstalk_instance_role_policy_worker" {
  role       = aws_iam_role.beanstalk_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier"
}

resource "aws_iam_role_policy_attachment" "beanstalk_instance_role_policy_multicontainer" {
  role       = aws_iam_role.beanstalk_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker"
}

# =========================
# Secrets Manager Access for Beanstalk Instances
# =========================
resource "aws_iam_role_policy" "beanstalk_instance_secrets_policy" {
  name = "${var.environment}-beanstalk-instance-secrets-policy"
  role = aws_iam_role.beanstalk_instance_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "secretsmanager:GetSecretValue"
        ],
        Resource = "arn:aws:secretsmanager:ap-south-1:221082209503:secret:beanstalk-nh1l14*"
      }
    ]
  })
}

# =========================
# Instance Profile
# =========================
resource "aws_iam_instance_profile" "beanstalk_instance_profile" {
  name = "${var.environment}-beanstalk-instance-profile"
  role = aws_iam_role.beanstalk_instance_role.name
}

# =========================
# CodeBuild Service Role
# =========================
resource "aws_iam_role" "codebuild_service_role" {
  name = "${var.environment}-codebuild-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codebuild.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.environment}-codebuild-service-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "codebuild_service_role_policy" {
  role       = aws_iam_role.codebuild_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSCodeBuildAdminAccess"
}

# =========================
# CodePipeline Service Role
# =========================
resource "aws_iam_role" "codepipeline_service_role" {
  name = "${var.environment}-codepipeline-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codepipeline.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.environment}-codepipeline-service-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy" "codepipeline_service_role_policy" {
  name = "${var.environment}-codepipeline-service-role-policy"
  role = aws_iam_role.codepipeline_service_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetBucketVersioning",
          "s3:PutObject"
        ]
        Resource = [
          "arn:aws:s3:::*-pipeline-artifacts",
          "arn:aws:s3:::*-pipeline-artifacts/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "codebuild:BatchGetBuilds",
          "codebuild:StartBuild"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "elasticbeanstalk:*"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:PutObject"
        ]
        Resource = [
          "arn:aws:s3:::elasticbeanstalk-*",
          "arn:aws:s3:::elasticbeanstalk-*/*"
        ]
      }
    ]
  })
}
