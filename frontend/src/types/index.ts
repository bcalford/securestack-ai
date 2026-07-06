export type Severity='CRITICAL'|'HIGH'|'MEDIUM'|'LOW'|'INFO';
export type Finding={id:string;fileName:string;lineNumber?:number;title:string;description:string;severity:Severity;category:string;confidence:string;evidence:string;recommendation:string;secureExample:string;status:string;ruleId:string};
export type Scan={id:string;name:string;createdAt:string;status:string;riskScore:number;riskLevel:string;fileCount:number;findingCount:number;aiProvider?:string;executiveSummary:string;remediationSummary:string;findings:Finding[];severityCounts:Record<string,number>;categoryCounts:Record<string,number>;files:string[]};
export type ScanListItem={id:string;name:string;createdAt:string;riskScore:number;riskLevel:string;findingCount:number};
export type PastedFile={fileName:string;fileType:string;content:string};

export type ControlMapping={framework:string;value:string};
export type RuleCatalogItem={id:string;title:string;category:string;severity:Severity;confidence?:string;description:string;recommendation:string;secureExample?:string;falsePositiveNote?:string;reviewDepthBehavior?:string;controlMappings?:ControlMapping[]};

export type ThreatModel={scanId:string;scanName:string;assets:string[];entryPoints:string[];trustBoundaries:string[];dataFlows:string[];assumptions:string[];abuseCases:string[];recommendedControls:string[];relatedFindingIds:string[]};
export type RiskPath={id:string;name:string;narrative:string;relatedFindingIds:string[];relatedRuleIds:string[];affectedFiles:string[];remediationThemes:string[]};
export type RiskPathResponse={scanId:string;scanName:string;riskPaths:RiskPath[]};
export type FixPlanItem={phase:string;title:string;severity:string;estimatedEffort:string;expectedRiskReduction:string;ownerCategory:string;verificationSteps:string[];affectedFiles:string[];relatedRuleIds:string[]};
export type FixPlan={scanId:string;scanName:string;fixFirst:FixPlanItem[];fixNext:FixPlanItem[];hardeningBacklog:FixPlanItem[]};
export type ChecklistItem={id:string;label:string;status:string;guidance:string};
export type SecurityChecklist={scanId:string;scanName:string;items:ChecklistItem[]};
