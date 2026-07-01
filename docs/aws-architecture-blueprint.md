# AWS Architecture Blueprint

SecureStack AI currently implements optional Amazon Bedrock summary generation for local/manual use. Mock AI remains the default.

## Current implemented AWS feature

- `AI_PROVIDER=mock`: default, local, deterministic, no AWS credentials required.
- `AI_PROVIDER=bedrock`: optional manual backend mode.
- `AWS_REGION`: Bedrock region, for example `us-east-1`.
- `BEDROCK_MODEL_ID`: model ID, default `amazon.nova-lite-v1:0`.
- `BEDROCK_SEND_RAW_CONTENT=false`: default. The prompt uses scan metadata, masked evidence, filenames, findings, and recommendations rather than raw uploaded source.
- Normal Docker/local mock mode requires no AWS credentials.

## Future deployment option A: AWS App Runner

App Runner can run the backend container with less cluster management than ECS.

- Frontend: S3 + CloudFront for static assets, or containerized nginx if keeping the current Docker serving model.
- Backend: App Runner service from an Amazon ECR image.
- Image registry: Amazon ECR.
- AI: Amazon Bedrock with least-privilege model invocation permissions.
- Secrets/config: AWS Secrets Manager or SSM Parameter Store for provider settings and database credentials.
- Persistence: RDS PostgreSQL instead of local demo persistence.
- Logs: CloudWatch Logs.
- Monitoring: CloudWatch metrics and alarms for error rates, latency, and Bedrock cost signals.
- CI/CD: GitHub Actions test/build/push/deploy pipeline.

## Future deployment option B: ECS Fargate

ECS Fargate provides more infrastructure control but requires more AWS networking and operations work.

- ALB terminates TLS and routes to backend tasks.
- ECS service runs Fargate tasks from ECR images.
- RDS PostgreSQL stores scans and findings.
- Secrets Manager or SSM Parameter Store stores secrets/config.
- CloudWatch captures logs, metrics, and alarms.
- IAM task roles grant least-privilege Bedrock and data access.
- VPC, public/private subnets, route tables, and security groups isolate services.

## Security requirements before public deployment

Authentication, authorization, rate limiting, upload abuse protection, strict file size/count limits, request body size limits, Bedrock cost controls, raw-content-to-Bedrock disabled by default, secret masking, private code warnings, logging without secrets, TLS, monitored error rates, dependency scanning, container scanning, least-privilege IAM, and no public unauthenticated scanner without abuse controls are mandatory.

## Deployment status

This repository is not currently a public production deployment or hosted scanner. Production AWS deployment automation remains future work.
