import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import App from '../App';
import type { Finding, Scan } from '../types';
import { topPriorityFindings } from '../utils/risk';

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
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
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
    expect(screen.getByText(/Analysis runs locally after import/i)).toBeInTheDocument();
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
  test('about page links to the static sample report', () => {
    renderPath('/about');

    expect(screen.getByRole('link', { name: /static sample report/i })).toHaveAttribute('href', '/sample-report');
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
    expect(screen.getByRole('heading', { name: 'Fix these first' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Defensive Security Review Summary' })).toBeInTheDocument();
    expect(screen.getByText('Prioritize secret rotation')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Findings' })).toBeInTheDocument();

    const findingCard = screen.getByLabelText('Update status for Hardcoded credential').closest('article');
    expect(findingCard).not.toBeNull();

    const finding = within(findingCard as HTMLElement);
    expect(finding.getByText('Evidence')).toBeInTheDocument();
    expect(finding.getByText('password=********')).toBeInTheDocument();
    expect(finding.getByText('Recommended fix')).toBeInTheDocument();
    expect(finding.getByText('Use a secrets manager and rotate exposed values.')).toBeInTheDocument();
    expect(finding.getByText('Secure example')).toBeInTheDocument();
    expect(finding.getByText('const password = process.env.DB_PASSWORD;')).toBeInTheDocument();
    expect(finding.getByLabelText('Update status for Hardcoded credential')).toHaveValue('OPEN');
    expect(finding.getByText('Rule ID: SEC-002')).toBeInTheDocument();
  });

  test('report actions show PDF and SARIF exports', async () => {
    mockScanResponse();
    renderPath('/scans/scan-1');

    expect(await screen.findByText('Export PDF report')).toHaveAttribute('href', '/api/scans/scan-1/report');
    expect(screen.getByRole('button', { name: 'Download SARIF' })).toBeInTheDocument();
  });

  test('SARIF export downloads from the expected endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify(scan), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ version: '2.1.0' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:sarif');
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    renderPath('/scans/scan-1');

    fireEvent.click(await screen.findByRole('button', { name: 'Download SARIF' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/scans/scan-1/sarif'));
    expect(createObjectUrl).toHaveBeenCalled();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:sarif');
  });

  test('SARIF export failure shows a controlled error', async () => {
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

    fireEvent.click(await screen.findByRole('button', { name: 'Download SARIF' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to download SARIF export. Please try again.');
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
  });

  test('finding status update behavior calls the API without reloading from the network', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => (
      init?.method === 'PATCH'
        ? new Response(null, { status: 204 })
        : new Response(JSON.stringify(scan), { status: 200, headers: { 'Content-Type': 'application/json' } })
    ));

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
      reviewDepthBehavior: 'Runs in STANDARD and FULL review depths unless filtered by focus area.',
    },
    {
      id: 'SEC-001',
      title: 'Secret detection',
      category: 'SECRETS',
      severity: 'HIGH',
      description: 'Detects committed credentials.',
      recommendation: 'Rotate exposed credentials and use a managed secret store.',
      reviewDepthBehavior: 'Runs in QUICK, STANDARD, and FULL review depths unless filtered by focus area.',
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
