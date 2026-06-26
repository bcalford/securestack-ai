# AWS deployment guidance

No AWS credentials are required for local use. Keep `AI_PROVIDER=mock` until a real provider is configured.

## Option 1: AWS App Runner
Build the backend container and deploy it to App Runner. Configure environment variables such as `AI_PROVIDER`, `MAX_FILE_SIZE_MB`, `MAX_SCAN_FILES`, and database settings. Use managed secrets for credentials.

## Option 2: ECS Fargate
Run the backend and frontend nginx containers as services behind an Application Load Balancer. Store secrets in AWS Secrets Manager or SSM Parameter Store.

## Frontend hosting
The Vite build can be served from S3 + CloudFront, AWS Amplify, or the included nginx container. If served separately, set the API base URL to the deployed backend.

## Future Bedrock notes
A Bedrock provider should use least-privilege IAM and must be optional. Do not commit AWS keys. Prefer task roles or workload identity.

## IAM caution
Avoid wildcard actions and resources. Scope permissions to the exact model, logs, registry, and deployment resources required.
