package com.securestack;

import com.securestack.analysis.RuleCatalogService;
import com.securestack.dto.Dto.RuleCatalogItem;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RuleCatalogTest {
    @Autowired MockMvc mvc;
    @Autowired RuleCatalogService catalog;

    @Test void endpointReturnsNonEmptyRulesAndKnownRule() throws Exception {
        mvc.perform(get("/api/rules"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").exists())
            .andExpect(jsonPath("$[?(@.id == 'SEC-001')]").exists())
            .andExpect(jsonPath("$[?(@.id == 'SEC-001')].controlMappings[0].framework").exists())
            .andExpect(jsonPath("$[?(@.id == 'SEC-001')].secureExample").exists())
            .andExpect(jsonPath("$[?(@.id == 'SEC-001')].falsePositiveNote").exists());
    }

    @Test void eachRuleHasRequiredMetadata() {
        assertThat(catalog.list()).isNotEmpty().allSatisfy(rule -> {
            assertThat(rule.category()).isNotNull();
            assertThat(rule.severity()).isNotNull();
            assertThat(rule.confidence()).isNotNull();
            assertThat(rule.description()).isNotBlank();
            assertThat(rule.recommendation()).isNotBlank();
            assertThat(rule.secureExample()).isNotBlank();
            assertThat(rule.falsePositiveNote()).isNotBlank();
        });
    }

    @Test void controlMappingsArePresentWhereExpected() {
        assertThat(catalog.list())
            .filteredOn(rule -> rule.id().equals("SEC-001"))
            .singleElement()
            .satisfies(rule -> assertThat(rule.controlMappings())
                .extracting(mapping -> mapping.framework())
                .contains("OWASP Top 10", "CWE", "NIST SSDF-lite", "ASVS-lite"));
    }

    @Test void outputIsDeterministicAndSorted() {
        List<RuleCatalogItem> first = catalog.list();
        List<RuleCatalogItem> second = catalog.list();
        assertThat(first).isEqualTo(second);
        assertThat(first.stream().map(RuleCatalogItem::id).toList()).isEqualTo(
            first.stream().map(RuleCatalogItem::id).sorted().toList());
        assertThat(first.stream().map(RuleCatalogItem::id).toList()).doesNotHaveDuplicates();
    }
}
