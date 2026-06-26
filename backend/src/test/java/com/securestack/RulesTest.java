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
    @Test void detectsWildcardCors() { assertTrue(detects("app.js", "app.use(cors({ origin: \"*\" }));", "API-001")); }
    @Test void detectsSqlInjectionPattern() { assertTrue(detects("app.js", "db.query('SELECT * FROM users WHERE id=' + id)", "INJ-001")); }
    @Test void detectsCommandExecution() { assertTrue(detects("app.js", "child_process.exec(command)", "INJ-002")); }
    @Test void detectsIamWildcard() { assertTrue(detects("policy.json", "{\"Action\":\"*\",\"Resource\":\"*\"}", "CLOUD-001")); }
    @Test void detectsPublicS3() { assertTrue(detects("main.tf", "block_public_acls = false", "CLOUD-002")); }
    @Test void detectsSecurityGroupExposure() { assertTrue(detects("main.tf", "cidr_blocks = [\"0.0.0.0/0\"]\nfrom_port = 22", "CLOUD-003")); }
    @Test void detectsDockerfileMissingUser() { assertTrue(detects("Dockerfile", "FROM node:20-alpine\nCOPY . .", "CTR-001")); }
}
