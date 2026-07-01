# GitHub URL Import

SecureStack AI can create a local security review from a public GitHub repository URL.

## Supported input

Use the **GitHub URL** mode on the scan form and enter a repository URL such as:

```text
https://github.com/owner/repo
```

The backend also supports a safely parsed branch URL when it follows GitHub's repository tree shape:

```text
https://github.com/owner/repo/tree/branch-name
```

## Local-first behavior

- Only public GitHub repositories are supported.
- No token, OAuth flow, GitHub App, or private repository connection is required or provided.
- SecureStack AI downloads a GitHub-generated archive after validating the repository URL.
- Imported files are analyzed locally by the backend using the same defensive rule engine as pasted, uploaded, and sample files.
- Imported code is treated as untrusted input and is not executed.

## Safety controls

GitHub URL import reuses the same scan safeguards as other file inputs:

- HTTPS-only `github.com` repository URLs.
- No credential-bearing URLs, SSH URLs, gists, raw file URLs, or arbitrary ZIP URLs.
- Download size limits.
- ZIP path traversal protection.
- Maximum file count and per-file size limits.
- Binary and unsupported file type rejection.
- Generated/vendor directory skipping.
- Raw file-content persistence disabled by default.

## Common failures

- **Invalid URL:** confirm the URL starts with `https://github.com/` and points to an owner/repository path.
- **Backend validation failure:** the URL shape, archive contents, file count, file size, or file type may be unsupported.
- **Download failure:** confirm the public repository exists and GitHub can serve the archive without authentication.

GitHub URL import is not GitHub code scanning integration. SARIF support remains export-only.
