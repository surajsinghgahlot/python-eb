# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  vpc_cidr           = var.vpc_cidr
  environment        = var.environment
  availability_zones = var.availability_zones
  public_subnets     = var.public_subnet_cidrs
  private_subnets    = var.private_subnet_cidrs
}

# IAM Module
module "iam" {
  source = "./modules/iam"

  environment = var.environment
}

# Elastic Beanstalk Module
module "elastic_beanstalk" {
  source = "./modules/elastic_beanstalk"
  
  aws_region          = var.aws_region
  environment          = var.environment
  application_name     = var.application_name
  solution_stack_name  = var.solution_stack_name
  instance_type        = var.instance_type
  min_size             = var.min_size
  max_size             = var.max_size
  vpc_id               = module.vpc.vpc_id
  private_subnets      = module.vpc.private_subnets
  public_subnets       = module.vpc.public_subnets
  key_pair_name        = var.key_pair_name
  iam_instance_profile = module.iam.beanstalk_instance_profile_name
  iam_service_role     = module.iam.beanstalk_service_role_name
}

# CodePipeline Module
module "codepipeline" {
  source = "./modules/codepipeline"
  
  environment                        = var.environment
  application_name                   = var.application_name
  codecommit_repository_name         = var.codecommit_repository_name
  branch_name                        = var.branch_name
  codebuild_service_role_arn         = module.iam.codebuild_service_role_arn
  codepipeline_service_role_arn      = module.iam.codepipeline_service_role_arn
  elastic_beanstalk_application_name = module.elastic_beanstalk.application_name
  elastic_beanstalk_environment_name = module.elastic_beanstalk.environment_name
}
