import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import App from '../App';
import type { Finding, FixPlan, RiskPathResponse, RuleCatalogItem, Scan, SecurityChecklist, ThreatModel } from '../types';
import { topPriorityFindings } from '../utils/risk';
import { compareScans } from '../utils/scanComparison';

const scan: Scan = {
  id: 'scan-1',
  name: 'Demo review',
  createdAt: '2026-06-26T00:00:00Z',
  status: 'COMPLETED',
  riskScore: 80,
  riskLevel: 'MODERATE',
  fileCount: 1,
  findingCount: 2,
  aiProvider: 'mock',
  executiveSummary: '### Defensive Security Review Summary\n\n- Prioritize secret rotation',
  remediationSummary: '**Remediation:**\n\n1. Rotate credentials',
  severityCounts: { HIGH: 1, MEDIUM: 1 },
  categoryCounts: { SECRETS: 1, API_SECURITY: 1 },
  files: ['app.js'],
  findings: [
    {
      id: 'finding-1',
      fileName: 'app.js',
      lineNumber: 1,
      title: 'Hardcoded credential',
      description: 'A credential-like value is present in source.',
      severity: 'HIGH',
      category: 'SECRETS',
      confidence: 'HIGH',
      evidence: 'password=********',
      recommendation: 'Use a secrets manager and rotate exposed values.',
      secureExample: 'const password = process.env.DB_PASSWORD;',
      status: 'OPEN',
      ruleId: 'SEC-002',
    },
    {
      id: 'finding-2',
      fileName: 'app.js',
      lineNumber: 2,
      title: 'Wildcard CORS policy',
      description: 'CORS permits every origin.',
      severity: 'MEDIUM',
      category: 'API_SECURITY',
      confidence: 'HIGH',
      evidence: 'Access-Control-Allow-Origin: *',
      recommendation: 'Restrict origins to a reviewed allowlist.',
      secureExample: 'origin: ["https://app.example.com"]',
      status: 'OPEN',
      ruleId: 'API-001',
    },
  ],
};


const threatModel: ThreatModel = {
  scanId: 'scan-1',
  scanName: 'Demo review',
  assets: ['Application source code', 'Environment secrets'],
  entryPoints: ['HTTP API routes'],
  trustBoundaries: ['Browser to API boundary'],
  dataFlows: ['Request data flows through API validation'],
  assumptions: ['Uploaded code is reviewed defensively and not executed'],
  abuseCases: ['Abuse case: exposed credentials could expand access if not rotated'],
  recommendedControls: ['Recommended control: rotate secrets and use managed secret storage'],
  relatedFindingIds: ['finding-1'],
};

const riskPaths: RiskPathResponse = {
  scanId: 'scan-1',
  scanName: 'Demo review',
  riskPaths: [{
    id: 'credential-exposure-path',
    name: 'Credential exposure risk path',
    narrative: 'Credential findings increase the chance of unauthorized access if values remain active.',
    relatedFindingIds: ['finding-1'],
    relatedRuleIds: ['SEC-002'],
    affectedFiles: ['app.js'],
    remediationThemes: ['Rotate exposed values and move secrets to managed storage'],
  }],
};

const fixPlan: FixPlan = {
  scanId: 'scan-1',
  scanName: 'Demo review',
  fixFirst: [{
    phase: 'fix first',
    title: 'Rotate hardcoded credential',
    severity: 'HIGH',
    estimatedEffort: 'Small',
    expectedRiskReduction: 'High',
    ownerCategory: 'backend',
    verificationSteps: ['Confirm secret is removed from source', 'Confirm replacement value is managed outside code'],
    affectedFiles: ['app.js'],
    relatedRuleIds: ['SEC-002'],
  }],
  fixNext: [{
    phase: 'fix next',
    title: 'Restrict CORS policy',
    severity: 'MEDIUM',
    estimatedEffort: 'Small',
    expectedRiskReduction: 'Medium',
    ownerCategory: 'backend',
    verificationSteps: ['Confirm allowed origins are explicitly configured'],
    affectedFiles: ['app.js'],
    relatedRuleIds: ['API-001'],
  }],
  hardeningBacklog: [],
};

const checklist: SecurityChecklist = {
  scanId: 'scan-1',
  scanName: 'Demo review',
  items: [{ id: 'secrets-reviewed', label: 'Secrets reviewed', status: 'pending', guidance: 'Review related finding IDs before release.' }],
};

const rulesCatalog: RuleCatalogItem[] = [
  {
    id: 'SEC-002',
    title: 'Hardcoded credential',
    category: 'SECRETS',
    severity: 'HIGH',
    description: 'Detects hardcoded credentials in source.',
    recommendation: 'Use a secrets manager and rotate exposed values.',
    controlMappings: [
      { framework: 'OWASP Top 10', value: 'A02:2021 Cryptographic Failures' },
      { framework: 'CWE', value: 'CWE-798 Use of Hard-coded Credentials' },
    ],
  },
];

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
}

const bedrockScan: Scan = {
  ...scan,
  aiProvider: 'bedrock',
  executiveSummary: '### Defensive Security Review Summary\n\n**Scan Name:** Portfolio security review\n\n- Prioritize secret rotation',
  remediationSummary: '**Remediation:**\n\n1. Rotate credentials',
};

function renderPath(path = '/') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockScanResponse(body: Scan = scan) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
    const url = String(input);
    if (url.endsWith('/threat-model')) return jsonResponse(threatModel);
    if (url.endsWith('/risk-paths')) return jsonResponse(riskPaths);
    if (url.endsWith('/fix-plan')) return jsonResponse(fixPlan);
    if (url.endsWith('/checklist')) return jsonResponse(checklist);
    if (url.endsWith('/rules')) return jsonResponse(rulesCatalog);
    return jsonResponse(body);
  });
}

function mockResultsFetchWithEndpoint(endpoint: string, body: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input);
    if (init?.method === 'PATCH') return new Response(null, { status: 204 });
    if (url.endsWith('/threat-model')) return jsonResponse(threatModel);
    if (url.endsWith('/risk-paths')) return jsonResponse(riskPaths);
    if (url.endsWith('/fix-plan')) return jsonResponse(fixPlan);
    if (url.endsWith('/checklist')) return jsonResponse(checklist);
    if (url.endsWith('/rules')) return jsonResponse(rulesCatalog);
    if (url.endsWith(endpoint)) return jsonResponse(body, status);
    return jsonResponse(scan);
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('landing page', () => {
  test('hero/title renders with primary and sample CTAs', () => {
    renderPath('/');

    expect(screen.getByRole('heading', { name: /AI-assisted security review for code and cloud config/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start a review' })).toHaveAttribute('href', '/scans/new');
    expect(screen.getByRole('link', { name: 'Run sample security review' })).toHaveAttribute(
      'href',
      '/scans/new?sample=full-portfolio-demo',
    );
  });

  test('hero includes a tertiary link to the static sample report', () => {
    renderPath('/');

    expect(screen.getByRole('link', { name: 'View sample report' })).toHaveAttribute('href', '/sample-report');
  });

  test('landing page explains safety and local-first handling', () => {
    renderPath('/');

    expect(screen.getByRole('heading', { name: 'Trust and safety' })).toBeInTheDocument();
    expect(screen.getByText(/treats uploaded files as untrusted, does not execute code/i)).toBeInTheDocument();
  });
});

describe('scan form', () => {
  test('step labels render and PDF auto-generation controls are not shown', () => {
    renderPath('/scans/new');

    expect(screen.getByRole('heading', { name: 'Step 1: Name the review' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Step 2: Add files' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Step 3: Configure review' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Step 4: Run review' })).toBeInTheDocument();
    expect(screen.queryByLabelText(/generate pdf/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /pdf/i })).not.toBeInTheDocument();
  });

  test('paste mode shows pasted file editor', () => {
    renderPath('/scans/new');

    expect(screen.getByLabelText('File name')).toBeInTheDocument();
    expect(screen.getByLabelText('Language/type')).toBeInTheDocument();
    expect(screen.getByLabelText('Paste text')).toBeInTheDocument();
  });

  test('upload mode shows upload input and hides pasted file editor', () => {
    renderPath('/scans/new');

    fireEvent.click(screen.getByRole('button', { name: 'Upload files' }));

    expect(screen.getByLabelText('Upload files or ZIP')).toHaveAttribute('type', 'file');
    expect(screen.queryByLabelText('Paste text')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add another pasted file' })).not.toBeInTheDocument();
  });

  test('sample mode shows selector and sample options', () => {
    renderPath('/scans/new');

    fireEvent.click(screen.getByRole('button', { name: 'Use sample' }));

    const selector = screen.getByLabelText('Sample review');
    expect(selector).toBeInTheDocument();
    expect(within(selector).getByRole('option', { name: 'Comprehensive sample review' })).toBeInTheDocument();
    expect(within(selector).getByRole('option', { name: 'Insecure Terraform' })).toBeInTheDocument();
  });



  test('GitHub URL mode renders local-only public repository guidance', () => {
    renderPath('/scans/new');

    fireEvent.click(screen.getByRole('button', { name: 'GitHub URL' }));

    expect(screen.getByLabelText('Public GitHub repository URL')).toBeInTheDocument();
    expect(screen.getByText(/Public GitHub repositories only/i)).toBeInTheDocument();
    expect(screen.getByText(/private repositories are not supported/i)).toBeInTheDocument();
    expect(screen.getByText(/repository is downloaded/i)).toBeInTheDocument();
    expect(screen.getByText(/analysis runs locally after import/i)).toBeInTheDocument();
    expect(screen.getByText(/No token is needed/i)).toBeInTheDocument();
    expect(screen.getByText(/Uploaded or imported code is not executed/i)).toBeInTheDocument();
  });

  test('entering a GitHub URL submits the expected repositoryUrl field', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ scanId: 'scan-github' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    renderPath('/scans/new');
    fireEvent.click(screen.getByRole('button', { name: 'GitHub URL' }));
    fireEvent.change(screen.getByLabelText('Public GitHub repository URL'), {
      target: { value: 'https://github.com/securestack/demo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run security review' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/api/scans/github',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      }),
    ));

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual(expect.objectContaining({
      repositoryUrl: 'https://github.com/securestack/demo',
      reviewDepth: 'STANDARD',
      generatePdf: false,
    }));
  });

  test('paste mode still submits valid pasted files', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ scanId: 'scan-paste' }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderPath('/scans/new');
    fireEvent.change(screen.getByLabelText('Paste text'), { target: { value: 'const ok = true;' } });
    fireEvent.click(screen.getByRole('button', { name: 'Run security review' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/scans', expect.objectContaining({ method: 'POST' })));
    const [, init] = fetchMock.mock.calls[0];
    const form = init?.body as FormData;
    expect(form.get('pastedFiles')).toContain('const ok = true;');
  });

  test('upload mode still submits selected files', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ scanId: 'scan-upload' }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderPath('/scans/new');
    fireEvent.click(screen.getByRole('button', { name: 'Upload files' }));
    fireEvent.change(screen.getByLabelText('Upload files or ZIP'), {
      target: { files: [new File(['FROM node:20'], 'Dockerfile', { type: 'text/plain' })] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run security review' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/scans', expect.objectContaining({ method: 'POST' })));
  });

  test('sample mode still submits preloaded sample files', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ scanId: 'scan-sample' }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderPath('/scans/new');
    fireEvent.click(screen.getByRole('button', { name: 'Use sample' }));
    fireEvent.click(screen.getByRole('button', { name: 'Run security review' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/scans', expect.objectContaining({ method: 'POST' })));
    const [, init] = fetchMock.mock.calls[0];
    const form = init?.body as FormData;
    expect(String(form.get('pastedFiles'))).toContain('server.js');
  });

  test('invalid empty submit remains controlled', () => {
    renderPath('/scans/new');

    fireEvent.click(screen.getByRole('button', { name: 'Run security review' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Add at least one valid pasted, uploaded, sample, or GitHub URL input/i);
  });

  test('invalid GitHub URL submit remains controlled without backend details', async () => {
    renderPath('/scans/new');

    fireEvent.click(screen.getByRole('button', { name: 'GitHub URL' }));
    fireEvent.change(screen.getByLabelText('Public GitHub repository URL'), { target: { value: 'http://example.com/repo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Run security review' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Enter a valid public GitHub repository URL/i);
  });

  test('no private repository or OAuth support claims appear', () => {
    renderPath('/scans/new');
    fireEvent.click(screen.getByRole('button', { name: 'GitHub URL' }));

    expect(screen.queryByText(/OAuth/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/private repo support/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/private repository support/i)).not.toBeInTheDocument();
  });

  test('sample URL param opens sample mode and preloads the full portfolio sample', () => {
    renderPath('/scans/new?sample=full-portfolio-demo');

    expect(screen.getByLabelText('Sample review')).toHaveValue('full-portfolio-demo');
    expect(screen.getByLabelText('Review name')).toHaveValue('Comprehensive sample review');
    expect(screen.getByDisplayValue('server.js')).toBeInTheDocument();
  });
});


describe('about and sample report pages', () => {
  test('about page explains what the app does and its local-first boundary', () => {
    renderPath('/about');

    expect(screen.getByRole('heading', { name: 'About SecureStack AI' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What it does' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Local-first security boundary' })).toBeInTheDocument();
    expect(screen.getByText(/never executed/i)).toBeInTheDocument();
  });

  test('about page links to the static sample report and rule catalog', () => {
    renderPath('/about');

    expect(screen.getByRole('link', { name: /static sample report/i })).toHaveAttribute('href', '/sample-report');
    expect(screen.getByRole('link', { name: /rule catalog/i })).toHaveAttribute('href', '/rules');
  });

  test('sample report renders real report content', () => {
    renderPath('/sample-report');

    expect(screen.getByRole('heading', { name: 'SecureStack AI Demo Portfolio Review' })).toBeInTheDocument();
    expect(screen.getAllByText('Risk score')[0]).toBeInTheDocument();
    expect(screen.getAllByText('78')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Demo API token committed in client configuration')[0]).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Methodology' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Limitations' })).toBeInTheDocument();
    expect(screen.queryByText(/placeholder/i)).not.toBeInTheDocument();
  });

  test('sample report clearly flags static sample data and offers the guided sample CTA', () => {
    renderPath('/sample-report');

    expect(screen.getByText(/Sample data.+not a live scan/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'About this sample report' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Run sample security review' })).toHaveAttribute(
      'href',
      '/scans/new?sample=full-portfolio-demo',
    );
  });
});



describe('scan comparison', () => {
  const newerScan: Scan = {
    ...scan,
    id: 'scan-2',
    name: 'Follow-up review',
    riskScore: 70,
    findingCount: 2,
    findings: [
      { ...scan.findings[0], severity: 'CRITICAL' },
      {
        id: 'finding-3',
        fileName: 'api.js',
        lineNumber: 8,
        title: 'Missing rate limiting',
        description: 'Endpoint has no throttling.',
        severity: 'LOW',
        category: 'API_SECURITY',
        confidence: 'MEDIUM',
        evidence: 'app.post("/login")',
        recommendation: 'Add rate limiting.',
        secureExample: 'rateLimit({ windowMs: 60000 })',
        status: 'OPEN',
        ruleId: 'API-004',
      },
    ],
    severityCounts: { CRITICAL: 1, LOW: 1 },
    categoryCounts: { SECRETS: 1, API_SECURITY: 1 },
  };

  test('comparison helper identifies new, resolved, unchanged, and changed findings', () => {
    const comparison = compareScans(scan, newerScan);

    expect(comparison.riskScoreDelta).toBe(-10);
    expect(comparison.findingCountDelta).toBe(0);
    expect(comparison.newFindings.map(item => item.right?.title)).toContain('Missing rate limiting');
    expect(comparison.resolvedFindings.map(item => item.left?.title)).toContain('Wildcard CORS policy');
    expect(comparison.changedFindings.map(item => item.right?.title)).toContain('Hardcoded credential');
    expect(comparison.unchangedFindings).toHaveLength(0);
  });



  test('comparison helper keeps unchanged findings separate from severity changes', () => {
    const right: Scan = {
      ...scan,
      id: 'scan-unchanged',
      findings: [scan.findings[0], { ...scan.findings[1], severity: 'HIGH' }],
      severityCounts: { HIGH: 2 },
      categoryCounts: scan.categoryCounts,
    };

    const comparison = compareScans(scan, right);

    expect(comparison.unchangedFindings.map(item => item.right?.title)).toContain('Hardcoded credential');
    expect(comparison.changedFindings.map(item => item.right?.title)).toContain('Wildcard CORS policy');
    expect(comparison.changedFindings[0].severityChanged).toBe(true);
    expect(comparison.severityDelta.HIGH).toBe(1);
  });

  test('compare page renders new and resolved findings', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(scan), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify(newerScan), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    renderPath('/scans/compare?left=scan-1&right=scan-2');

    expect(await screen.findByRole('heading', { name: 'New findings' })).toBeInTheDocument();
    expect(screen.getByText(/Missing rate limiting/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Resolved findings' })).toBeInTheDocument();
    expect(screen.getByText(/Wildcard CORS policy/)).toBeInTheDocument();
  });

  test('empty comparison state is controlled', () => {
    renderPath('/scans/compare');

    expect(screen.getByRole('heading', { name: 'Regression review' })).toBeInTheDocument();
    expect(screen.getByText(/Select two completed scans from history/i)).toBeInTheDocument();
  });

  test('compare page renders two scan names and risk delta', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(scan), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify(newerScan), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    renderPath('/scans/compare?left=scan-1&right=scan-2');

    expect(await screen.findByText('Demo review')).toBeInTheDocument();
    expect(screen.getByText('Follow-up review')).toBeInTheDocument();
    expect(screen.getByText('-10')).toBeInTheDocument();
  });

  test('compare page renders unchanged findings and explains matching limitations', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(scan), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify(newerScan), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    renderPath('/scans/compare?left=scan-1&right=scan-2');

    expect(await screen.findByRole('heading', { name: 'Unchanged findings' })).toBeInTheDocument();
    expect(screen.getByText('No unchanged findings between these scans.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Changed findings' })).toBeInTheDocument();
    expect(screen.getByText('Hardcoded credential — app.js:1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How findings are matched' })).toBeInTheDocument();
    expect(screen.getByText(/matched between scans by rule ID, file, line, title, category, and evidence/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Choose different scans' })).toHaveAttribute('href', '/scans');
  });

  test('scan history allows selecting two scans for comparison', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([scan, newerScan]), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderPath('/scans');

    const checks = await screen.findAllByLabelText('Select for regression review');
    fireEvent.click(checks[0]);
    fireEvent.click(checks[1]);

    expect(screen.getByRole('link', { name: 'Compare selected scans' })).toHaveAttribute('href', '/scans/compare?left=scan-1&right=scan-2');
    expect(screen.getByRole('link', { name: 'Compare selected scans' })).toHaveAttribute('aria-disabled', 'false');
  });

  test('scan history renders scan cards with risk level, score, and finding count', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([scan, newerScan]), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderPath('/scans');

    expect(screen.getByRole('heading', { name: 'Previous scans' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Demo review' })).toHaveAttribute('href', '/scans/scan-1');
    expect(screen.getByRole('link', { name: 'Follow-up review' })).toHaveAttribute('href', '/scans/scan-2');
    expect(screen.getAllByText('Risk level: MODERATE')).toHaveLength(2);
    expect(screen.getByText('Risk score: 80/100')).toBeInTheDocument();
    expect(screen.getByText('Risk score: 70/100')).toBeInTheDocument();
    expect(screen.getAllByText('Findings: 2')).toHaveLength(2);
    expect(screen.getByText('2 scan(s) in history.')).toBeInTheDocument();
  });

  test('scan history empty state is controlled', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderPath('/scans');

    expect(await screen.findByText('No scans yet. Start a new security review to populate history.')).toBeInTheDocument();
  });

  test('scan history error state is controlled', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'backend detail' }), { status: 500, headers: { 'Content-Type': 'application/json' } }),
    );

    renderPath('/scans');

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load scan history.');
    expect(screen.queryByText('backend detail')).not.toBeInTheDocument();
  });
});

describe('results page', () => {
  test('risk, provider, fix-first, markdown summary, findings, and supplied details render', async () => {
    mockScanResponse();
    renderPath('/scans/scan-1');

    expect(await screen.findByRole('heading', { name: 'Demo review' })).toBeInTheDocument();
    expect(screen.getByText(/MODERATE risk based on/)).toBeInTheDocument();
    expect(screen.getAllByText('Risk score')[0]).toBeInTheDocument();
    expect(screen.getAllByText('80')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Summary provider: mock')[0]).toBeInTheDocument();
    expect(screen.getByText('Files reviewed: 1')).toBeInTheDocument();
    expect(screen.getByText('Findings: 2')).toBeInTheDocument();
    expect(screen.getByText('Files in this review (1)')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fix these first' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Defensive Security Review Summary' })).toBeInTheDocument();
    expect(screen.getByText('Prioritize secret rotation')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Findings' })).toBeInTheDocument();
    expect(screen.getByText('Showing 2 of 2 finding(s).')).toBeInTheDocument();

    const fixFirstLink = screen.getByRole('link', { name: 'Hardcoded credential' });
    expect(fixFirstLink).toHaveAttribute('href', '#finding-finding-1');

    const findingCard = screen.getByLabelText('Update status for Hardcoded credential').closest('article');
    expect(findingCard).not.toBeNull();
    expect(findingCard).toHaveAttribute('id', 'finding-finding-1');

    const finding = within(findingCard as HTMLElement);
    expect(finding.getByText('Confidence: HIGH')).toBeInTheDocument();
    expect(finding.getByText('Status: OPEN')).toBeInTheDocument();
    expect(finding.getByText('Evidence')).toBeInTheDocument();
    expect(finding.getByText('password=********')).toBeInTheDocument();
    expect(finding.getByText('Recommended fix')).toBeInTheDocument();
    expect(finding.getByText('Use a secrets manager and rotate exposed values.')).toBeInTheDocument();
    expect(finding.getByText('Secure example')).toBeInTheDocument();
    expect(finding.getByText('const password = process.env.DB_PASSWORD;')).toBeInTheDocument();
    expect(finding.getByText('Control mappings')).toBeInTheDocument();
    expect(finding.getByText(/OWASP Top 10: A02:2021 Cryptographic Failures/)).toBeInTheDocument();
    expect(finding.getByLabelText('Update status for Hardcoded credential')).toHaveValue('OPEN');
    expect(finding.getByText('Rule ID: SEC-002')).toBeInTheDocument();
  });


  test('results page exposes security review artifact sections', async () => {
    mockScanResponse();
    renderPath('/scans/scan-1');

    expect(await screen.findByRole('heading', { name: 'Security review artifacts' })).toBeInTheDocument();
    expect(await screen.findByText('Threat model')).toBeInTheDocument();
    expect(screen.getByText('Risk paths')).toBeInTheDocument();
    expect(screen.getByText('Fix plan')).toBeInTheDocument();
    expect(screen.getByText('Security review checklist')).toBeInTheDocument();
    expect(screen.getByText(/Assets, entry points, trust boundaries, and abuse cases inferred/)).toBeInTheDocument();
    expect(screen.getByText(/A verification-driven checklist for confirming remediation/)).toBeInTheDocument();
  });

  test('mocked threat model renders defensive sections', async () => {
    mockScanResponse();
    renderPath('/scans/scan-1');

    expect(await screen.findByText('Application source code')).toBeInTheDocument();
    expect(screen.getByText('HTTP API routes')).toBeInTheDocument();
    expect(screen.getByText('Browser to API boundary')).toBeInTheDocument();
    expect(screen.getByText('Abuse case: exposed credentials could expand access if not rotated')).toBeInTheDocument();
    expect(screen.getByText('Recommended control: rotate secrets and use managed secret storage')).toBeInTheDocument();
  });

  test('mocked risk path renders narrative and related findings', async () => {
    mockScanResponse();
    renderPath('/scans/scan-1');

    fireEvent.click(await screen.findByText('Risk paths'));
    expect(screen.getByText('Credential exposure risk path')).toBeInTheDocument();
    expect(screen.getByText(/Credential findings increase/)).toBeInTheDocument();
    expect(screen.getByText(/finding-1/)).toBeInTheDocument();
    expect(screen.getByText(/Rotate exposed values/)).toBeInTheDocument();
  });

  test('mocked fix plan renders phases and verification steps', async () => {
    mockScanResponse();
    renderPath('/scans/scan-1');

    fireEvent.click(await screen.findByText('Fix plan'));
    expect(screen.getByText('Fix first')).toBeInTheDocument();
    expect(screen.getByText('Rotate hardcoded credential')).toBeInTheDocument();
    expect(screen.getByText('Confirm secret is removed from source')).toBeInTheDocument();
    expect(screen.getByText('Fix next')).toBeInTheDocument();
  });

  test('mocked checklist renders status and category', async () => {
    mockScanResponse();
    renderPath('/scans/scan-1');

    fireEvent.click(await screen.findByText('Security review checklist'));
    expect(screen.getByText('Secrets reviewed')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('Category: secrets-reviewed')).toBeInTheDocument();
  });

  test('artifact API failure shows a controlled error', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
      const url = String(input);
      if (url.endsWith('/threat-model')) return jsonResponse({ message: 'backend detail' }, 500);
      if (url.endsWith('/risk-paths')) return jsonResponse(riskPaths);
      if (url.endsWith('/fix-plan')) return jsonResponse(fixPlan);
      if (url.endsWith('/checklist')) return jsonResponse(checklist);
      return jsonResponse(scan);
    });

    renderPath('/scans/scan-1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load security review artifacts. Please try again.');
    expect(screen.queryByText('backend detail')).not.toBeInTheDocument();
  });

  test('report actions show PDF, SARIF, JSON, and bundle exports', async () => {
    mockScanResponse();
    renderPath('/scans/scan-1');

    expect(await screen.findByText('Export PDF report')).toHaveAttribute('href', '/api/scans/scan-1/report');
    expect(screen.getByRole('button', { name: 'Download SARIF' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download JSON' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download bundle' })).toBeInTheDocument();
    expect(screen.getByText(/Hardened SARIF 2.1.0 JSON for import into code scanning tools/)).toBeInTheDocument();
    expect(screen.getByText(/Full structured scan data for local tooling or automation/)).toBeInTheDocument();
    expect(screen.getByText(/ZIP containing the generated reports for handoff or archival/)).toBeInTheDocument();
  });

  test('SARIF export downloads from the expected endpoint', async () => {
    const fetchMock = mockResultsFetchWithEndpoint('/sarif', { version: '2.1.0' });

    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:sarif');
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    renderPath('/scans/scan-1');

    fireEvent.click(await screen.findByRole('button', { name: 'Download SARIF' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/scans/scan-1/sarif'));
    expect(createObjectUrl).toHaveBeenCalled();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:sarif');
  });

  test('SARIF export failure shows a controlled error', async () => {
    mockResultsFetchWithEndpoint('/sarif', { message: 'backend detail' }, 500);

    renderPath('/scans/scan-1');

    fireEvent.click(await screen.findByRole('button', { name: 'Download SARIF' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to download SARIF export. Please try again.');
    expect(screen.queryByText('backend detail')).not.toBeInTheDocument();
  });


  test('JSON export downloads from the expected endpoint', async () => {
    const fetchMock = mockResultsFetchWithEndpoint('/export/json', { format: 'SecureStack JSON Report' });

    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:json');
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    renderPath('/scans/scan-1');

    fireEvent.click(await screen.findByRole('button', { name: 'Download JSON' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/scans/scan-1/export/json'));
    expect(createObjectUrl).toHaveBeenCalled();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:json');
  });

  test('JSON export failure shows a controlled error', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify(scan), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'backend detail' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    renderPath('/scans/scan-1');

    fireEvent.click(await screen.findByRole('button', { name: 'Download JSON' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to download JSON export. Please try again.');
    expect(screen.queryByText('backend detail')).not.toBeInTheDocument();
  });



  test('bundle export downloads from the expected endpoint', async () => {
    const fetchMock = mockResultsFetchWithEndpoint('/bundle', new Blob(['zip-bytes'], { type: 'application/zip' }));

    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:bundle');
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    renderPath('/scans/scan-1');

    fireEvent.click(await screen.findByRole('button', { name: 'Download bundle' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/scans/scan-1/bundle'));
    expect(createObjectUrl).toHaveBeenCalled();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:bundle');
  });

  test('bundle export failure shows a controlled error', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify(scan), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'backend detail' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    renderPath('/scans/scan-1');

    fireEvent.click(await screen.findByRole('button', { name: 'Download bundle' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to download export bundle. Please try again.');
    expect(screen.queryByText('backend detail')).not.toBeInTheDocument();
  });

  test('results page shows bedrock provider', async () => {
    mockScanResponse(bedrockScan);
    renderPath('/scans/scan-1');

    expect(await screen.findAllByText('Summary provider: bedrock')).toHaveLength(2);
  });

  test('markdown summary renders clean text without raw markers/html', async () => {
    const unsafeScan: Scan = {
      ...bedrockScan,
      executiveSummary: '### Safe Heading\n\n<script>alert(1)</script>\n\n- Safe item',
    };

    mockScanResponse(unsafeScan);
    const { container } = renderPath('/scans/scan-1');

    expect(await screen.findByRole('heading', { name: 'Safe Heading' })).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('.markdown-summary')?.textContent).not.toContain('###');
  });

  test('empty filtered state renders when no findings match', async () => {
    mockScanResponse();
    renderPath('/scans/scan-1');

    await screen.findAllByText('Hardcoded credential');
    fireEvent.change(screen.getByLabelText('Search findings'), { target: { value: 'no-match' } });

    expect(screen.getByText(/No findings match the current filters/)).toBeInTheDocument();
    expect(screen.getByText('Showing 0 of 2 finding(s).')).toBeInTheDocument();
  });

  test('results page status summary renders', async () => {
    mockScanResponse({ ...scan, findings: [scan.findings[0], { ...scan.findings[1], status: 'FIXED' }] });
    renderPath('/scans/scan-1');

    expect(await screen.findByRole('heading', { name: 'Remediation workflow' })).toBeInTheDocument();
    expect(screen.getByText('Open findings')).toBeInTheDocument();
    expect(screen.getByText('Fixed findings')).toBeInTheDocument();
  });

  test('confidence filtering and status sorting work', async () => {
    mockScanResponse({ ...scan, findings: [scan.findings[0], { ...scan.findings[1], confidence: 'MEDIUM', status: 'FIXED' }] });
    renderPath('/scans/scan-1');

    await screen.findAllByText('Hardcoded credential');
    fireEvent.change(screen.getByLabelText('Filter confidence'), { target: { value: 'MEDIUM' } });

    const findingList = screen.getByLabelText('Finding details');
    expect(within(findingList).queryByText('Hardcoded credential')).not.toBeInTheDocument();
    expect(within(findingList).getByText('Wildcard CORS policy')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filter confidence'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Sort findings'), { target: { value: 'status' } });

    const headings = screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent);
    expect(headings).toEqual(expect.arrayContaining(['Hardcoded credential', 'Wildcard CORS policy']));
  });

  test('finding status update behavior calls the API without reloading from the network', async () => {
    const fetchMock = mockResultsFetchWithEndpoint('/unused', {});

    renderPath('/scans/scan-1');

    await screen.findAllByText('Hardcoded credential');
    fireEvent.change(screen.getByLabelText('Update status for Hardcoded credential'), { target: { value: 'REVIEWED' } });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/api/scans/scan-1/findings/finding-1',
      expect.objectContaining({ method: 'PATCH' }),
    ));
  });

  test('error state remains controlled', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'stack trace' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    renderPath('/scans/missing');

    expect(await screen.findByText(/Unable to load this review/)).toBeInTheDocument();
    expect(screen.queryByText('stack trace')).not.toBeInTheDocument();
  });
});

test('results top findings sorts correctly', () => {
  expect(topPriorityFindings(scan.findings as Finding[])[0].title).toBe('Hardcoded credential');
});
describe('rule catalog page', () => {
  const rules = [
    {
      id: 'API-001',
      title: 'Wildcard CORS policy',
      category: 'API_SECURITY',
      severity: 'MEDIUM',
      description: 'Detects wildcard CORS origins.',
      recommendation: 'Restrict CORS to trusted origins.',
      secureExample: 'cors({ origin: [\'https://app.example.test\'] })',
      falsePositiveNote: 'Public static resources may differ.',
      reviewDepthBehavior: 'Runs in STANDARD and FULL review depths unless filtered by focus area.',
      controlMappings: [
        { framework: 'OWASP Top 10', value: 'A05:2021 Security Misconfiguration' },
        { framework: 'CWE', value: 'CWE-942 Permissive Cross-domain Policy' },
      ],
    },
    {
      id: 'SEC-001',
      title: 'Secret detection',
      category: 'SECRETS',
      severity: 'HIGH',
      confidence: 'HIGH',
      description: 'Detects committed credentials.',
      recommendation: 'Rotate exposed credentials and use a managed secret store.',
      secureExample: 'AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}',
      falsePositiveNote: 'Sample keys may be fake.',
      reviewDepthBehavior: 'Runs in QUICK, STANDARD, and FULL review depths unless filtered by focus area.',
      controlMappings: [
        { framework: 'OWASP Top 10', value: 'A02:2021 Cryptographic Failures' },
        { framework: 'CWE', value: 'CWE-798 Use of Hard-coded Credentials' },
      ],
    },
  ];

  test('/rules renders rule catalog with mocked API rules', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(rules), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderPath('/rules');

    expect(screen.getByRole('heading', { name: 'Rule Catalog' })).toBeInTheDocument();
    expect(await screen.findByText('Secret detection')).toBeInTheDocument();
    expect(screen.getByText('API-001')).toBeInTheDocument();
    expect(screen.getByText(/OWASP Top 10: A02:2021 Cryptographic Failures/)).toBeInTheDocument();
  });

  test('/rules search filters rendered rules', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(rules), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderPath('/rules');

    await screen.findByText('Secret detection');
    fireEvent.change(screen.getByLabelText('Search rules'), { target: { value: 'cors' } });

    expect(screen.getByText('Wildcard CORS policy')).toBeInTheDocument();
    expect(screen.queryByText('Secret detection')).not.toBeInTheDocument();
  });

  test('/rules category and severity filters work', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(rules), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderPath('/rules');

    await screen.findByText('Secret detection');
    fireEvent.change(screen.getByLabelText('Filter category'), { target: { value: 'API_SECURITY' } });
    expect(screen.getByText('Wildcard CORS policy')).toBeInTheDocument();
    expect(screen.queryByText('Secret detection')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filter category'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Filter severity'), { target: { value: 'HIGH' } });
    expect(screen.getByText('Secret detection')).toBeInTheDocument();
    expect(screen.queryByText('Wildcard CORS policy')).not.toBeInTheDocument();
  });

  test('/rules shows a rule count summary, confidence badge, and false-positive note', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(rules), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderPath('/rules');

    await screen.findByText('Secret detection');
    expect(screen.getByText('Showing 2 of 2 rule(s).')).toBeInTheDocument();
    expect(screen.getByText('Confidence: HIGH')).toBeInTheDocument();
    expect(screen.getByText('Sample keys may be fake.')).toBeInTheDocument();
  });

  test('/rules clear filters button resets search and restores hidden rules', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(rules), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderPath('/rules');

    await screen.findByText('Secret detection');
    fireEvent.change(screen.getByLabelText('Search rules'), { target: { value: 'no-match-at-all' } });

    expect(screen.getByText('No rules match your filter.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.getByText('Secret detection')).toBeInTheDocument();
    expect(screen.getByText('Wildcard CORS policy')).toBeInTheDocument();
  });

  test('/rules shows controlled empty and error states', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderPath('/rules');
    expect(await screen.findByText('No rules are currently published in the catalog.')).toBeInTheDocument();

    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'backend detail' }), { status: 500, headers: { 'Content-Type': 'application/json' } }),
    );

    renderPath('/rules');
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load rule catalog.');
    expect(screen.queryByText('backend detail')).not.toBeInTheDocument();
  });
});
