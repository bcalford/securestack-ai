package com.securestack;

import com.securestack.analysis.SecurityRule;
import com.securestack.dto.Dto.ScanFileInput;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class RulesTest {
    @Autowired List<SecurityRule> rules;

    private boolean detects(String fileName, String content, String ruleId) {
        ScanFileInput file = new ScanFileInput(fileName, "txt", content);
        return rules.stream().flatMap(rule -> rule.analyze(file).stream()).anyMatch(finding -> finding.ruleId.equals(ruleId));
    }

    @Test void detectsHardcodedSecret() { assertTrue(detects("app.js", "const key = \"EXAMPLE_PRIVATE_KEY\";", "SEC-001")); }
    @Test void detectsEnvSecret() { assertTrue(detects(".env", "PASSWORD=supersecret123", "SEC-002")); }
    @Test void detectsDatabaseUrlWithCredentials() { assertTrue(detects("application.properties", "DATABASE_URL=postgres://app:secret123@db.internal/app", "SEC-003")); }
    @Test void detectsWildcardCors() { assertTrue(detects("app.js", "app.use(cors({ origin: \"*\" }));", "API-001")); }
    @Test void detectsMissingSecureCookieFlag() { assertTrue(detects("app.js", "res.setHeader('Set-Cookie', 'sid=abc; HttpOnly; SameSite=Lax')", "APP-001")); }
    @Test void detectsMissingHttpOnlyCookieFlag() { assertTrue(detects("app.js", "res.setHeader('Set-Cookie', 'sid=abc; Secure; SameSite=Lax')", "APP-003")); }
    @Test void detectsMissingSameSiteCookieFlag() { assertTrue(detects("app.js", "res.setHeader('Set-Cookie', 'sid=abc; Secure; HttpOnly')", "APP-004")); }
    @Test void detectsWeakSessionConfiguration() { assertTrue(detects("application.properties", "server.servlet.session.cookie.secure=false", "AUTH-003")); }
    @Test void detectsDebugModeFlag() { assertTrue(detects("settings.py", "DEBUG = true", "APP-002")); }
    @Test void detectsVerboseErrorExposure() { assertTrue(detects("application.properties", "server.error.include-stacktrace=always", "APP-006")); }
    @Test void detectsSqlInjectionPattern() { assertTrue(detects("app.js", "db.query('SELECT * FROM users WHERE id=' + id)", "INJ-001")); }
    @Test void detectsCommandExecution() { assertTrue(detects("app.js", "child_process.exec(command)", "INJ-002")); }
    @Test void detectsDangerousDeserializationIndicator() { assertTrue(detects("worker.py", "payload = pickle.loads(raw_message)", "INJ-003")); }
    @Test void detectsIamWildcard() { assertTrue(detects("policy.json", "{\"Action\":\"*\",\"Resource\":\"*\"}", "CLOUD-001")); }
    @Test void detectsPublicS3() { assertTrue(detects("main.tf", "block_public_acls = false", "CLOUD-002")); }
    @Test void detectsSecurityGroupExposure() { assertTrue(detects("main.tf", "cidr_blocks = [\"0.0.0.0/0\"]\nfrom_port = 22", "CLOUD-003")); }
    @Test void detectsDockerfileMissingUser() { assertTrue(detects("Dockerfile", "FROM node:20-alpine\nCOPY . .", "CTR-001")); }
    @Test void detectsDockerfileRootUser() { assertTrue(detects("Dockerfile", "FROM node:20-alpine\nUSER root", "CTR-001")); }
    @Test void detectsDockerfileLatestTag() { assertTrue(detects("Dockerfile", "FROM node:latest\nUSER node", "CTR-002")); }
    @Test void detectsDockerfilePackageCacheLeftovers() { assertTrue(detects("Dockerfile", "FROM ubuntu:24.04\nRUN apt-get update && apt-get install -y curl\nUSER app", "CTR-003")); }
    @Test void detectsNpmInstallScriptRisk() { assertTrue(detects("package.json", "{\"scripts\":{\"postinstall\":\"node scripts/setup.js\"}}", "DEP-002")); }
    @Test void detectsPlaintextHttpEndpoint() { assertTrue(detects("application.yml", "callbackUrl: http://api.example.test/callback", "CFG-001")); }
    @Test void detectsDisabledTlsVerification() { assertTrue(detects("client.py", "requests.get(url, verify=False)", "CFG-002")); }
    @Test void detectsWeakJwtSecretPattern() { assertTrue(detects(".env", "JWT_SECRET=secret", "AUTH-001")); }
}
