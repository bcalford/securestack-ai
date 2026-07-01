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

  test('sample URL param opens sample mode and preloads the full portfolio sample', () => {
    renderPath('/scans/new?sample=full-portfolio-demo');

    expect(screen.getByLabelText('Sample review')).toHaveValue('full-portfolio-demo');
    expect(screen.getByLabelText('Review name')).toHaveValue('Comprehensive sample review');
    expect(screen.getByDisplayValue('server.js')).toBeInTheDocument();
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