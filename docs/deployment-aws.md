# AWS Deployment Notes

This repository is not currently deployed as a public AWS production service or hosted scanner. The implemented AWS-aware feature is optional local/manual Amazon Bedrock summary generation; mock AI remains the default.

For the detailed architecture blueprint, see [`aws-architecture-blueprint.md`](aws-architecture-blueprint.md).

Before public deployment, add authentication, authorization, upload abuse controls, rate limits, TLS, Bedrock cost controls, production storage, monitored logs/metrics, dependency/container scanning, least-privilege IAM, migration management, and tenant/user boundaries. v0.4-alpha does not include production AWS deployment automation.
