import type { Finding, Scan, Severity } from '../types';

const order: Record<Severity, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
const confidence: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export function severityRank(severity: Severity) { return order[severity] ?? 99; }

export function sortFindingsByPriority(findings: Finding[]) {
  return [...findings].sort((a, b) => severityRank(a.severity) - severityRank(b.severity)
    || (confidence[a.confidence] ?? 9) - (confidence[b.confidence] ?? 9)
    || a.category.localeCompare(b.category)
    || a.fileName.localeCompare(b.fileName)
    || (a.lineNumber ?? 0) - (b.lineNumber ?? 0));
}

export function topPriorityFindings(findings: Finding[], limit = 3) { return sortFindingsByPriority(findings).slice(0, limit); }

export function buildRiskExplanation(scan: Scan) {
  if (!scan.findingCount) return 'No high-risk findings were detected. Continue manual review before production use.';
  const high = (scan.severityCounts.CRITICAL ?? 0) + (scan.severityCounts.HIGH ?? 0);
  const medium = scan.severityCounts.MEDIUM ?? 0;
  const categories = Object.entries(scan.categoryCounts).filter(([, count]) => count > 0).map(([name]) => name.toLowerCase().replace(/_/g, ' ')).slice(0, 3).join(', ');
  if (high) return `${scan.riskLevel} risk because ${high} critical/high and ${medium} medium findings were detected${categories ? ` across ${categories}` : ''}.`;
  return `${scan.riskLevel} risk because ${medium} medium findings were detected${categories ? ` across ${categories}` : ''}.`;
}
