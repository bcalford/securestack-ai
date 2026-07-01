package com.securestack.analysis;

import com.securestack.dto.Dto.RuleCatalogItem;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class RuleCatalogService {
    private final List<SecurityRule> rules;

    public RuleCatalogService(List<SecurityRule> rules) {
        this.rules = rules;
    }

    public List<RuleCatalogItem> list() {
        return rules.stream()
            .map(rule -> new RuleCatalogItem(
                rule.id(),
                rule.name(),
                rule.category(),
                rule.defaultSeverity(),
                rule.description(),
                rule.recommendation(),
                rule.reviewDepthBehavior()))
            .sorted(Comparator.comparing(RuleCatalogItem::id))
            .toList();
    }
}
