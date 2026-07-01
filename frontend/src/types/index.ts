export type Severity='CRITICAL'|'HIGH'|'MEDIUM'|'LOW'|'INFO';
export type Finding={id:string;fileName:string;lineNumber?:number;title:string;description:string;severity:Severity;category:string;confidence:string;evidence:string;recommendation:string;secureExample:string;status:string;ruleId:string};
export type Scan={id:string;name:string;createdAt:string;status:string;riskScore:number;riskLevel:string;fileCount:number;findingCount:number;aiProvider?:string;executiveSummary:string;remediationSummary:string;findings:Finding[];severityCounts:Record<string,number>;categoryCounts:Record<string,number>;files:string[]};
export type ScanListItem={id:string;name:string;createdAt:string;riskScore:number;riskLevel:string;findingCount:number};
export type PastedFile={fileName:string;fileType:string;content:string};

export type RuleCatalogItem={id:string;title:string;category:string;severity:Severity;description:string;recommendation:string;reviewDepthBehavior?:string};
