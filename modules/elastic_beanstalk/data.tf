# Data sources for current region and account
data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

# Create a zip file of the application
data "archive_file" "app_zip" {
  type        = "zip"
  output_path = "${path.module}/application.zip"

  source {
    content  = file("${path.root}/app.js")
    filename = "app.js"
  }

  source {
    content  = file("${path.root}/package.json")
    filename = "package.json"
  }
}


# Upload application package to S3
resource "aws_s3_object" "app_zip" {
  bucket = "elasticbeanstalk-${data.aws_region.current.name}-${data.aws_caller_identity.current.account_id}"
  key    = "application.zip"
  source = data.archive_file.app_zip.output_path
  etag   = data.archive_file.app_zip.output_md5
}

# Create Beanstalk application version
resource "aws_elastic_beanstalk_application_version" "app_version" {
  application = aws_elastic_beanstalk_application.app.name
  bucket      = aws_s3_object.app_zip.bucket
  key         = aws_s3_object.app_zip.key
  name        = "version1"
  description = "App version"
}
