# Elastic Beanstalk Application
resource "aws_elastic_beanstalk_application" "app" {
  name        = var.application_name
  description = "Elastic Beanstalk application for ${var.application_name}"

  lifecycle {
    ignore_changes = [tags]
  }

  tags = {
    Name        = var.application_name
    Environment = var.environment
  }
}

# Elastic Beanstalk Environment
resource "aws_elastic_beanstalk_environment" "env" {
  name                = "${var.application_name}-${var.environment}"
  application         = aws_elastic_beanstalk_application.app.name
  version_label       = aws_elastic_beanstalk_application_version.app_version.name
  solution_stack_name = var.solution_stack_name

  # Environment variables
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PORT"
    value     = var.app_port
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "ENV"
    value     = var.environment
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "APPLICATION_NAME"
    value     = var.application_name
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EMAIL_SMTP_HOST"
    value     = var.email_smtp_host
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "MAIL_SERVICE"
    value     = var.mail_service
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EMAIL_SMTP_PORT"
    value     = var.email_smtp_port
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EMAIL_SMTP_USERNAME"
    value     = var.email_smtp_username
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EMAIL_SMTP_PASSWORD"
    value     = var.email_smtp_password
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EMAIL_SMTP_SECURE"
    value     = var.email_smtp_secure
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "LIVE_URL_DB"
    value     = var.db_host
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "ACCESS_TOKEN_SECRET"
    value     = var.access_token_secret
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "ACCESS_TOKEN_TIMEOUT_DURATION"
    value     = var.access_token_timeout_duration
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "REFRESH_TOKEN_SECRET"
    value     = var.refresh_token_secret
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "REFRESH_TOKEN_TIMEOUT_DURATION"
    value     = var.refresh_token_timeout_duration
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "VENDOR_SECRET"
    value     = var.vendor_secret
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "CRYPTO_SECRET_KEY"
    value     = var.crypto_secret_key
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "BUCKET_S3_ZONE"
    value     = var.bucket_s3_zone
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "BUCKET_SECRET_ACCESS_KEY"
    value     = var.bucket_secret_access_key
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "BUCKET_ACCESS_KEY_ID"
    value     = var.bucket_access_key_id
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "S3_IMAGE_BUCKET"
    value     = var.s3_image_bucket
  }

  # Instance profile
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = var.iam_instance_profile
  }

  # Service role
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = var.iam_service_role
  }

  # Instance type
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.instance_type
  }

  # Security Groups
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = var.elastic_beanstalk_security_group_id
  }

  # Load Balancer Security Groups
  setting {
    namespace = "aws:elbv2:loadbalancer"
    name      = "SecurityGroups"
    value     = var.load_balancer_security_group_id
  }

  # ASG scaling
  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MinSize"
    value     = var.min_size
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MaxSize"
    value     = var.max_size
  }

  # VPC configuration
  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = var.vpc_id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", var.private_subnets)
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "ELBScheme"
    value     = "public"
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "ELBSubnets"
    value     = join(",", var.public_subnets)
  }

  # Load balancer type
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "LoadBalancerType"
    value     = "application"
  }

  # Environment type
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "LoadBalanced"
  }

  # Health check settings
  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "HealthCheckPath"
    value     = "/health"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "Port"
    value     = var.app_port
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "HealthCheckInterval"
    value     = "30"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "HealthCheckTimeout"
    value     = "5"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "HealthyThresholdCount"
    value     = "3"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "UnhealthyThresholdCount"
    value     = "5"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "StickinessEnabled"
    value     = "false"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application"
    name      = "Application Healthcheck URL"
    value     = "/health"
  }

  # CloudWatch Logs configuration
  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "StreamLogs"
    value     = "true"
  }

  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "DeleteOnTerminate"
    value     = "false"
  }

  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "RetentionInDays"
    value     = "7"
  }

  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "LogToCloudWatchLogs"
    value     = "true"
  }

  # Enhanced monitoring and health reporting
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnhancedHealthReporting"
    value     = "enhanced"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ManagedActionsEnabled"
    value     = "true"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "PreferredStartTime"
    value     = "Sun:02:00"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = var.iam_service_role
  }


  # Rolling deployment configuration
  setting {
    namespace = "aws:autoscaling:updatepolicy:rollingupdate"
    name      = "RollingUpdateEnabled"
    value     = "true"
  }

  setting {
    namespace = "aws:autoscaling:updatepolicy:rollingupdate"
    name      = "RollingUpdateType"
    value     = "Health"
  }

  setting {
    namespace = "aws:autoscaling:updatepolicy:rollingupdate"
    name      = "MaxBatchSize"
    value     = "1"
  }

  setting {
    namespace = "aws:autoscaling:updatepolicy:rollingupdate"
    name      = "MinInstancesInService"
    value     = "1"
  }

  setting {
    namespace = "aws:autoscaling:updatepolicy:rollingupdate"
    name      = "PauseTime"
    value     = "PT0S"
  }

  # Node.js environment settings
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NPM_USE_PRODUCTION"
    value     = "false"
  }

  # Node.js startup command
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = "production"
  }

  lifecycle {
    ignore_changes = [
      version_label,
      tags,
      tags_all
    ]
  }

  # Optional EC2 key pair
  dynamic "setting" {
    for_each = var.key_pair_name != "" ? [1] : []
    content {
      namespace = "aws:autoscaling:launchconfiguration"
      name      = "EC2KeyName"
      value     = var.key_pair_name
    }
  }

  tags = {
    Name        = "${var.application_name}-${var.environment}"
    Environment = var.environment
  }
}
