import type { Finding, Scan, Severity } from '../types';

export type ComparedFinding = {
  key: string;
  left?: Finding;
  right?: Finding;
  severityChanged: boolean;
  statusChanged: boolean;
  fileChanged: boolean;
  categoryChanged: boolean;
};

export type ScanComparison = {
  riskScoreDelta: number;
  findingCountDelta: number;
  severityDelta: Partial<Record<Severity, number>>;
  categoryDelta: Record<string, number>;
  newFindings: ComparedFinding[];
  resolvedFindings: ComparedFinding[];
  unchangedFindings: ComparedFinding[];
  changedFindings: ComparedFinding[];
};

function normalize(value?: string | null) {
  return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizedEvidence(finding: Finding) {
  return normalize(finding.evidence);
}

export function findingComparisonKey(finding: Finding) {
  return [
    normalize(finding.ruleId || finding.title),
    normalize(finding.fileName),
    finding.lineNumber ?? '',
    normalize(finding.title),
    normalize(finding.category),
    normalizedEvidence(finding),
  ].join('::');
}

function findingFallbackKey(finding: Finding) {
  return [
    normalize(finding.ruleId || finding.title),
    finding.lineNumber ?? '',
    normalize(finding.title),
    normalizedEvidence(finding),
  ].join('::');
}

function comparePair(key: string, left?: Finding, right?: Finding): ComparedFinding {
  return {
    key,
    left,
    right,
    severityChanged: Boolean(left && right && left.severity !== right.severity),
    statusChanged: Boolean(left && right && left.status !== right.status),
    fileChanged: Boolean(left && right && left.fileName !== right.fileName),
    categoryChanged: Boolean(left && right && left.category !== right.category),
  };
}

function countDelta<T extends string>(left: Record<T, number> | undefined, right: Record<T, number> | undefined) {
  const keys = Array.from(new Set([...Object.keys(left ?? {}), ...Object.keys(right ?? {})])) as T[];
  return keys.sort().reduce<Record<T, number>>((acc, key) => {
    acc[key] = (right?.[key] ?? 0) - (left?.[key] ?? 0);
    return acc;
  }, {} as Record<T, number>);
}

function mapFindings(findings: Finding[]) {
  return findings.reduce<Map<string, Finding[]>>((acc, finding) => {
    const key = findingComparisonKey(finding);
    acc.set(key, [...(acc.get(key) ?? []), finding]);
    return acc;
  }, new Map());
}

function takeFallbackMatch(finding: Finding, candidates: Finding[]) {
  const fallbackKey = findingFallbackKey(finding);
  const index = candidates.findIndex(candidate => findingFallbackKey(candidate) === fallbackKey);
  if (index < 0) return undefined;
  const [match] = candidates.splice(index, 1);
  return match;
}

export function compareScans(left: Scan, right: Scan): ScanComparison {
  const rightByKey = mapFindings(right.findings);
  const unmatchedRight = [...right.findings];
  const newFindings: ComparedFinding[] = [];
  const resolvedFindings: ComparedFinding[] = [];
  const unchangedFindings: ComparedFinding[] = [];
  const changedFindings: ComparedFinding[] = [];

  left.findings.forEach(leftFinding => {
    const key = findingComparisonKey(leftFinding);
    const exactMatches = rightByKey.get(key) ?? [];
    const rightFinding = exactMatches.shift() ?? takeFallbackMatch(leftFinding, unmatchedRight);
    if (rightFinding) {
      const exactUnmatchedIndex = unmatchedRight.indexOf(rightFinding);
      if (exactUnmatchedIndex >= 0) unmatchedRight.splice(exactUnmatchedIndex, 1);
      const compared = comparePair(key, leftFinding, rightFinding);
      if (compared.severityChanged || compared.statusChanged || compared.fileChanged || compared.categoryChanged) changedFindings.push(compared);
      else unchangedFindings.push(compared);
      return;
    }
    resolvedFindings.push(comparePair(key, leftFinding));
  });

  unmatchedRight.forEach(rightFinding => {
    newFindings.push(comparePair(findingComparisonKey(rightFinding), undefined, rightFinding));
  });

  const sortByKey = (items: ComparedFinding[]) => items.sort((a, b) => a.key.localeCompare(b.key));

  return {
    riskScoreDelta: right.riskScore - left.riskScore,
    findingCountDelta: right.findingCount - left.findingCount,
    severityDelta: countDelta(left.severityCounts, right.severityCounts),
    categoryDelta: countDelta(left.categoryCounts, right.categoryCounts),
    newFindings: sortByKey(newFindings),
    resolvedFindings: sortByKey(resolvedFindings),
    unchangedFindings: sortByKey(unchangedFindings),
    changedFindings: sortByKey(changedFindings),
  };
}
