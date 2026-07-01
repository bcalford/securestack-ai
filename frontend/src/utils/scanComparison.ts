import type { Finding, Scan } from '../types';

export type ComparedFinding = {
  key: string;
  left?: Finding;
  right?: Finding;
  severityChanged: boolean;
  categoryChanged: boolean;
};

export type ScanComparison = {
  riskScoreDelta: number;
  findingCountDelta: number;
  newFindings: ComparedFinding[];
  resolvedFindings: ComparedFinding[];
  unchangedFindings: ComparedFinding[];
  changedFindings: ComparedFinding[];
};

export function findingComparisonKey(finding: Finding) {
  return [
    finding.ruleId || finding.title,
    finding.fileName,
    finding.lineNumber ?? '',
    finding.title,
  ].join('::').toLowerCase();
}

function comparePair(key: string, left?: Finding, right?: Finding): ComparedFinding {
  return {
    key,
    left,
    right,
    severityChanged: Boolean(left && right && left.severity !== right.severity),
    categoryChanged: Boolean(left && right && left.category !== right.category),
  };
}

export function compareScans(left: Scan, right: Scan): ScanComparison {
  const leftByKey = new Map(left.findings.map(finding => [findingComparisonKey(finding), finding]));
  const rightByKey = new Map(right.findings.map(finding => [findingComparisonKey(finding), finding]));
  const keys = Array.from(new Set([...leftByKey.keys(), ...rightByKey.keys()])).sort();

  const newFindings: ComparedFinding[] = [];
  const resolvedFindings: ComparedFinding[] = [];
  const unchangedFindings: ComparedFinding[] = [];
  const changedFindings: ComparedFinding[] = [];

  keys.forEach(key => {
    const leftFinding = leftByKey.get(key);
    const rightFinding = rightByKey.get(key);
    const compared = comparePair(key, leftFinding, rightFinding);

    if (!leftFinding && rightFinding) newFindings.push(compared);
    else if (leftFinding && !rightFinding) resolvedFindings.push(compared);
    else if (compared.severityChanged || compared.categoryChanged) changedFindings.push(compared);
    else unchangedFindings.push(compared);
  });

  return {
    riskScoreDelta: right.riskScore - left.riskScore,
    findingCountDelta: right.findingCount - left.findingCount,
    newFindings,
    resolvedFindings,
    unchangedFindings,
    changedFindings,
  };
}
