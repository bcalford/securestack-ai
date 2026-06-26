# Security Model

SecureStack AI treats uploaded files as untrusted. It validates file count, size, and extension; excludes common large directories from ZIPs; never executes uploaded code; masks evidence snippets; and defaults to mock AI with no external credential requirement.

## Secret handling
Raw uploaded secrets are not intended to be persisted by default. Evidence snippets are masked before display. If `STORE_RAW_FILES=true` is added for local experiments, users should understand the privacy risk and avoid real credentials.

## LLM handling
The default `AI_PROVIDER=mock` keeps analysis local. Future real providers must avoid sending secrets unless users explicitly opt in and must not invent findings or provide offensive exploit steps.

## Limitations
This is a static defensive review, not a complete audit, vulnerability scanner, or exploit framework.
