resource "aws_s3_bucket_acl" "bad" { acl = "public-read" }
resource "aws_s3_bucket_public_access_block" "bad" { block_public_acls = false block_public_policy = false ignore_public_acls = false }
resource "aws_iam_policy" "admin" { policy = jsonencode({ Statement=[{ Action="*", Resource="*" }] }) }
resource "aws_security_group_rule" "ssh" { cidr_blocks=["0.0.0.0/0"] from_port=22 to_port=22 protocol="tcp" }
