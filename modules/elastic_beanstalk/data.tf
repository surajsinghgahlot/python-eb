# Data sources for current region and account
data "aws_region" "current" {}
data "aws_caller_identity" "current" {}