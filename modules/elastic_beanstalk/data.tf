# Data sources for current region and account
data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

# Create a zip file of the application
data "archive_file" "app_zip" {
  type        = "zip"
  output_path = "${path.module}/application.zip"

  source {
    content  = file("${path.root}/app.py")
    filename = "app.py"
  }

  source {
    content  = file("${path.root}/requirements.txt")
    filename = "requirements.txt"
  }
}