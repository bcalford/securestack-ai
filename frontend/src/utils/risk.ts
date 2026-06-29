import type { Finding, Scan, Severity } from '../types';

const severityOrder: Record<Severity, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  INFO: 4,
};

const confidenceOrder: Record<string, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export function severityRank(severity: Severity) {
  return severityOrder[severity] ?? 99;
}

export function sortFindingsByPriority(findings: Finding[]) {
  return [...findings].sort((a, b) => {
    return (
      severityRank(a.severity) - severityRank(b.severity)
      || (confidenceOrder[a.confidence] ?? 9) - (confidenceOrder[b.confidence] ?? 9)
      || a.category.localeCompare(b.category)
      || a.fileName.localeCompare(b.fileName)
      || (a.lineNumber ?? 0) - (b.lineNumber ?? 0)
    );
  });
}

export function topPriorityFindings(findings: Finding[], limit = 3) {
  return sortFindingsByPriority(findings).slice(0, limit);
}

function formatCategory(category: string) {
  return category.toLowerCase().replace(/_/g, ' ');
}

function pluralize(count: number, label: string) {
  return `${count} ${label}${count === 1 ? '' : 's'}`;
}

export function buildRiskExplanation(scan: Scan) {
  if (!scan.findingCount) {
    return 'No findings were detected by the current rules. Keep a manual review step before using the code in production.';
  }

  const criticalHigh = (scan.severityCounts.CRITICAL ?? 0) + (scan.severityCounts.HIGH ?? 0);
  const medium = scan.severityCounts.MEDIUM ?? 0;
  const categories = Object.entries(scan.categoryCounts)
    .filter(([, count]) => count > 0)
    .map(([name]) => formatCategory(name))
    .slice(0, 3)
    .join(', ');

  const severityPhrase = criticalHigh > 0
    ? `${pluralize(criticalHigh, 'critical/high finding')} and ${pluralize(medium, 'medium finding')}`
    : `${pluralize(medium, 'medium finding')}`;

  return `${scan.riskLevel} risk based on ${severityPhrase}${categories ? ` across ${categories}` : ''}.`;
}
