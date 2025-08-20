# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  vpc_cidr           = var.vpc_cidr
  environment        = var.environment
  availability_zones = var.availability_zones
  public_subnets     = var.public_subnet_cidrs
  private_subnets    = var.private_subnet_cidrs
  inbound_ports      = var.inbound_ports
  enable_nat_gateway = true
  single_nat_gateway = true
}

# IAM Module
module "iam" {
  source = "./modules/iam"

  environment      = var.environment
  application_name = var.application_name
}

# Elastic Beanstalk Module
module "elastic_beanstalk" {
  source = "./modules/elastic_beanstalk"
  
  environment          = var.environment
  application_name     = var.application_name
  solution_stack_name  = var.solution_stack_name
  instance_type        = var.instance_type
  min_size             = var.min_size
  max_size             = var.max_size
  vpc_id               = module.vpc.vpc_id
  app_port             = var.app_port
  private_subnets      = module.vpc.private_subnets
  public_subnets       = module.vpc.public_subnets
  key_pair_name        = var.key_pair_name
  iam_instance_profile = module.iam.beanstalk_instance_profile_name
  iam_service_role     = module.iam.beanstalk_service_role_name
  elastic_beanstalk_security_group_id = module.vpc.elastic_beanstalk_security_group_id
  load_balancer_security_group_id     = module.vpc.load_balancer_security_group_id

  #env config
  email_smtp_host     = var.email_smtp_host
  mail_service        = var.mail_service
  email_smtp_port     = var.email_smtp_port
  email_smtp_username = var.email_smtp_username
  email_smtp_password = var.email_smtp_password
  email_smtp_secure   = var.email_smtp_secure
  db_host  = var.db_host
  access_token_secret           = var.access_token_secret
  access_token_timeout_duration = var.access_token_timeout_duration
  refresh_token_secret          = var.refresh_token_secret
  refresh_token_timeout_duration = var.refresh_token_timeout_duration
  vendor_secret                 = var.vendor_secret
  crypto_secret_key             = var.crypto_secret_key
  bucket_s3_zone           = var.bucket_s3_zone
  bucket_secret_access_key = var.bucket_secret_access_key
  bucket_access_key_id     = var.bucket_access_key_id
  s3_image_bucket          = var.s3_image_bucket

  depends_on = [ 
    module.vpc,
    module.iam ]
}

# CodePipeline Module
# module "codepipeline" {
#   source = "./modules/codepipeline"
  
#   environment                        = var.environment
#   application_name                   = var.application_name
#   github_owner                       = var.github_owner
#   github_repository                  = var.github_repository
#   github_branch                      = var.github_branch
#   github_oauth_token                 = var.github_oauth_token
#   codebuild_service_role_arn         = module.iam.codebuild_service_role_arn
#   codepipeline_service_role_arn      = module.iam.codepipeline_service_role_arn
#   elastic_beanstalk_application_name = module.elastic_beanstalk.application_name
#   elastic_beanstalk_environment_name = module.elastic_beanstalk.environment_name

#   depends_on = [ 
#     module.elastic_beanstalk,
#     module.iam ]
# }
