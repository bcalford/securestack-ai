package com.securestack.analysis.rules;

import com.securestack.dto.Dto.ScanFileInput;
import com.securestack.model.Entities.Finding;
import com.securestack.model.Enums.*;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class S3PublicAccessRule extends BaseSecurityRule {
    public String id() { return "CLOUD-002"; }
    public String name() { return "Public S3 access"; }
    public Category category() { return Category.CLOUD_CONFIGURATION; }
    public Severity defaultSeverity() { return Severity.HIGH; }
    public boolean supports(ScanFileInput file) { return true; }

    public List<Finding> analyze(ScanFileInput file) {
        return scan(file, Pattern.compile("public-read|block_public_acls.*false|block_public_policy.*false|ignore_public_acls.*false|Principal.*[*]", Pattern.CASE_INSENSITIVE), "Public S3 access risk", Severity.HIGH, Category.CLOUD_CONFIGURATION, "Enable S3 Block Public Access and restrict bucket policies.");
    }
}
