import type { RuleCatalogItem, Scan, ScanListItem } from '../types';

const API = import.meta.env.VITE_API_BASE_URL || '/api';

async function parseError(response: Response) {
  try {
    return (await response.json()).message || response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function createScan(form: FormData) {
  const response = await fetch(`${API}/scans`, { method: 'POST', body: form });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<{ scanId: string }>;
}

export async function createGitHubScan(request: {
  repositoryUrl: string;
  scanName: string;
  reviewDepth: string;
  focusAreas: string;
}) {
  const response = await fetch(`${API}/scans/github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, generatePdf: false }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<{ scanId: string }>;
}

export async function getScan(id: string) {
  const response = await fetch(`${API}/scans/${id}`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<Scan>;
}

export async function listScans() {
  const response = await fetch(`${API}/scans`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<ScanListItem[]>;
}

export async function listRules() {
  const response = await fetch(`${API}/rules`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<RuleCatalogItem[]>;
}

export async function updateFindingStatus(scanId: string, findingId: string, status: string) {
  const response = await fetch(`${API}/scans/${scanId}/findings/${findingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error(await parseError(response));
}

export async function deleteScan(scanId: string) {
  const response = await fetch(`${API}/scans/${scanId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(await parseError(response));
}

export const reportUrl = (id: string) => `${API}/scans/${id}/report`;
export const sarifUrl = (id: string) => `${API}/scans/${id}/sarif`;

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function downloadSarif(scanId: string) {
  const response = await fetch(sarifUrl(scanId));
  if (!response.ok) throw new Error(await parseError(response));
  triggerDownload(await response.blob(), `securestack-scan-${scanId}.sarif.json`);
}
