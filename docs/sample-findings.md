# Sample Findings

The `samples/` directory contains small demo projects for exercising SecureStack AI. Findings are heuristic defensive triage signals and should be validated before remediation is prioritized.

## Suggested samples

- `samples/vulnerable-node-api/server.js` — demonstrates application findings such as hardcoded secrets, permissive CORS, SQL injection patterns, command execution patterns, sensitive logging, and missing defensive controls.
- `samples/insecure-terraform/main.tf` — demonstrates cloud/IaC findings such as public S3 indicators, wildcard IAM permissions, and broad security group exposure.
- `samples/insecure-docker/Dockerfile` — demonstrates container hardening findings such as missing non-root user configuration.
- `samples/vulnerable-spring-api/` — demonstrates Java/Spring-style security review inputs.
- `samples/clean-example/` — provides a lower-risk comparison sample.

## Notes

- The app does not execute sample code.
- The mock AI summary is generated locally and does not call external AI services.
- Results can vary as rule text and sample files evolve.
