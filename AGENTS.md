# AGENTS.md

## Project goal

Build and maintain SecureStack AI, a production-quality portfolio project that demonstrates full-stack software engineering, AI-assisted analysis, cybersecurity, cloud-readiness, and technical documentation.

## Working expectations

- Keep code clean, typed, and modular.
- Prefer clear service boundaries.
- Do not hardcode secrets.
- Do not introduce real API keys.
- Use mock AI provider by default.
- Keep the app runnable locally.
- Update documentation when behavior changes.
- Add tests for new backend rules.
- Run backend and frontend tests before completing major changes.
- Favor a complete working MVP over unfinished advanced features.

## Frontend expectations

- Use React and TypeScript.
- Use Vite.
- Prefer reusable components.
- Keep pages responsive.
- Use accessible labels and semantic HTML.
- Keep API types centralized.
- Keep styling clean, technical, and recruiter-friendly.

## Backend expectations

- Use Java 21 and Spring Boot.
- Keep controllers thin.
- Put business logic in services.
- Put detection logic in rule classes.
- Use DTOs for API responses.
- Validate uploaded files.
- Avoid storing raw secrets unnecessarily.
- Do not execute uploaded code.

## Security expectations

- Treat uploaded files as untrusted.
- Sanitize displayed snippets.
- Enforce file size limits.
- Do not execute uploaded code.
- Do not provide exploit instructions.
- Keep all analysis defensive.
- Do not persist raw secrets by default.

## Documentation expectations

- Keep README, ARCHITECTURE, SECURITY_MODEL, and ROADMAP current.
- Maintain sample vulnerable projects for demos.
- Include setup, testing, Docker, and deployment instructions.