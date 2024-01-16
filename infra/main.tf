terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source  = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = "ca-central-1"
}

locals {
  function_create_obituary = "create_obituary_30145677"
  function_get_obituaries  = "get_obituaries_30145677"
  handler_name             = "main.lambda_handler"
  artifact_name_create     = "create_artifact.zip"
  artifact_name_get        = "get_artifact.zip"
}


# create a role for the Lambda save function to assume
# every service on AWS that wants to call other AWS services should first assume a role and
# then any policy attached to the role will give permissions
# to the service so it can interact with other AWS services
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
resource "aws_iam_role" "lambda-create" {
  name               = "iam-for-lambda-${local.function_create_obituary}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}


# create a role for the Lambda get function to assume
# every service on AWS that wants to call other AWS services should first assume a role and
# then any policy attached to the role will give permissions
# to the service so it can interact with other AWS services
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
resource "aws_iam_role" "lambda-get" {
  name               = "iam-for-lambda-${local.function_get_obituaries}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

data "archive_file" "lambda-create" {
  type        = "zip"
  source_dir  = "../functions/create-obituary"
  output_path = "create_artifact.zip"
}


data "archive_file" "lambda-get" {
  type        = "zip"
  source_file = "../functions/get-obituaries/main.py"
  output_path = "get_artifact.zip"
}


# create a Lambda function for creating
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
resource "aws_lambda_function" "create_obituary_30145677" {
  role             = aws_iam_role.lambda-create.arn
  function_name    = local.function_create_obituary
  handler          = local.handler_name
  filename         = local.artifact_name_create
  source_code_hash = data.archive_file.lambda-create.output_base64sha256
  timeout          = 60

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"
}


# create a Lambda function for getting
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
resource "aws_lambda_function" "get_obituaries_30145677" {
  role             = aws_iam_role.lambda-get.arn
  function_name    = local.function_get_obituaries
  handler          = local.handler_name
  filename         = local.artifact_name_get
  source_code_hash = data.archive_file.lambda-get.output_base64sha256

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"
}


# create a policy for publishing save logs to CloudWatch
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy

resource "aws_iam_policy" "logs-create" {
  name        = "lambda-logging-${local.function_create_obituary}-2"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath",
        "polly:SynthesizeSpeech"
      ],
      "Resource": "*",
      "Effect": "Allow"
    }
  ]
}
EOF
}


# create a policy for publishing getting logs to CloudWatch
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy
resource "aws_iam_policy" "logs-get" {
  name        = "lambda-logging-${local.function_get_obituaries}-2"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "ssm:GetParameter"
      ],
      "Resource": ["arn:aws:logs:*:*:*", "${aws_dynamodb_table.obituary-30139727.arn}"],
      "Effect": "Allow"
    }
  ]
}
EOF
}


# attach the above policy to the save function role
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment
resource "aws_iam_role_policy_attachment" "lambda_logs_create" {
  role       = aws_iam_role.lambda-create.name
  policy_arn = aws_iam_policy.logs-create.arn
}


# attach the above policy to the save function role
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment
resource "aws_iam_role_policy_attachment" "lambda_logs_get" {
  role       = aws_iam_role.lambda-get.name
  policy_arn = aws_iam_policy.logs-get.arn
}


# create a save Function URL for Lambda 
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function_url
resource "aws_lambda_function_url" "url-create" {
  function_name      = aws_lambda_function.create_obituary_30145677.function_name
  authorization_type = "NONE"
  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}


# create a get Function URL for Lambda 
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function_url
resource "aws_lambda_function_url" "url-get" {
  function_name      = aws_lambda_function.get_obituaries_30145677.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}


# show the save Function URL after creation
output "lambda_url-create" {
  value = aws_lambda_function_url.url-create.function_url
}


# show the get Function URL after creation
output "lambda_url-get" {
  value = aws_lambda_function_url.url-get.function_url
}


# Dynamodb table 
# read the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table
resource "aws_dynamodb_table" "obituary-30139727" {
  name         = "obituary-30139727"
  billing_mode = "PROVISIONED"

  read_capacity = 1

  write_capacity = 1

  hash_key = "uuid"
  # range_key = "created_at"

  attribute {
    name = "uuid"
    type = "S"
  }

  # attribute {
  #   name = "created_at"
  #   type = "S"
  # }

}
