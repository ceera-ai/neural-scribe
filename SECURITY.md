# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by opening a private security advisory on GitHub or creating an issue with the `security` label.

**Please do not open public issues for critical security vulnerabilities without first consulting the maintainers.**

### What to Include

When reporting a security vulnerability, please include:

- **Description**: Clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Potential Impact**: Assessment of the severity and potential impact
- **Suggested Fix**: If you have ideas for fixing the issue (optional)
- **Environment**: OS, app version, and relevant configuration details

### Response Time

- We will acknowledge your report within **48 hours**
- We will provide a detailed response within **7 days**
- We will release a fix as soon as possible, depending on severity

## Security Measures

Neural Scribe implements several security measures to protect users:

### 1. Electron Sandbox

- **Renderer processes** run in sandboxed mode, limiting access to system resources
- **Context isolation** enabled for all renderer processes
- **nodeIntegration** disabled in renderer processes

### 2. IPC Validation

- All IPC messages validated with **Zod schemas** before processing
- Type-safe communication between main and renderer processes
- Input sanitization to prevent injection attacks

### 3. Secure Storage

- API keys stored using **electron-store** with encryption
- Sensitive data never logged or exposed in plain text
- Local storage isolated per application

### 4. Content Security Policy

- Strict CSP headers configured to prevent XSS attacks
- No inline scripts or eval() usage
- External resources loaded only from trusted sources

### 5. No Remote Code Execution

- No `eval()`, `Function()`, or similar dangerous APIs
- No remote code loading or dynamic script execution
- All code bundled and verified at build time

### 6. Dependency Security

- Regular dependency audits via `npm audit`
- Automated security updates via Dependabot
- Minimal dependency footprint to reduce attack surface

## Security Best Practices for Users

When using Neural Scribe:

1. **Keep API Keys Secure**
   - Never share your ElevenLabs or Claude API keys
   - Revoke and regenerate keys if you suspect compromise
   - Use environment variables for API keys during development

2. **Update Regularly**
   - Keep Neural Scribe updated to the latest version
   - Enable automatic updates when available
   - Review release notes for security patches

3. **Review Permissions**
   - Understand what system permissions the app requests
   - Only grant necessary permissions (microphone, accessibility)
   - Review accessibility permissions periodically

4. **Report Suspicious Behavior**
   - Report any unexpected behavior immediately
   - Check console logs for errors or warnings
   - Monitor network requests in developer tools

5. **Use Trusted Sources**
   - Only download Neural Scribe from official sources (GitHub releases)
   - Verify checksums of downloaded binaries
   - Be cautious of unofficial forks or builds

## Known Security Considerations

### Microphone Access

Neural Scribe requires microphone access for transcription. The app:

- Only accesses the microphone when explicitly recording
- Does not store audio data (only transcripts)
- Uses browser APIs with user permission prompts

### Accessibility Permissions (macOS)

For terminal automation on macOS, the app requires accessibility permissions to:

- Detect the active terminal application
- Paste transcribed text to the terminal

These permissions are:

- Optional (manual paste is available as alternative)
- Only used for the specific paste action
- Never used to read or monitor other applications

### Network Requests

The app makes network requests to:

- **ElevenLabs API**: For real-time transcription (WebSocket connection)
- **Anthropic API**: For optional prompt formatting (HTTPS)

All network requests:

- Use HTTPS/WSS encrypted connections
- Include authentication tokens (never sent in plain text)
- Are made only when explicitly triggered by user actions

## Threat Model

### In Scope

- Vulnerabilities in the Electron application
- IPC injection attacks
- XSS or code injection vulnerabilities
- Insecure storage of credentials
- Privilege escalation
- Memory corruption bugs

### Out of Scope

- Third-party API vulnerabilities (ElevenLabs, Anthropic)
- Social engineering attacks
- Physical access attacks
- Denial of Service (DoS) attacks
- Issues in dependencies (report to upstream)

## Security Audit History

| Date       | Auditor  | Findings | Status   |
| ---------- | -------- | -------- | -------- |
| 2025-12-20 | Internal | 0        | Complete |

## Contact

For security-related questions or concerns:

- **GitHub Issues**: [github.com/yourusername/neural-scribe/issues](https://github.com/yourusername/neural-scribe/issues)
- **Email**: security@yourproject.com (if applicable)

---

Thank you for helping keep Neural Scribe secure!

**Last Updated**: 2025-12-20
