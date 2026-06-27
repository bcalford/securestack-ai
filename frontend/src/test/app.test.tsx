import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import App from '../App';

const scan = { id:'scan-1', name:'Demo scan', createdAt:'2026-06-26T00:00:00Z', status:'COMPLETED', riskScore:80, riskLevel:'MODERATE', fileCount:1, findingCount:2, aiProvider:'mock', executiveSummary:'Summary', remediationSummary:'Fix things', severityCounts:{HIGH:1,MEDIUM:1}, categoryCounts:{SECRETS:1,API_SECURITY:1}, files:['app.js'], findings:[{id:'finding-1',fileName:'app.js',lineNumber:1,title:'Hardcoded credential',description:'desc',severity:'HIGH',category:'SECRETS',confidence:'HIGH',evidence:'masked',recommendation:'Use secrets manager',secureExample:'Use env vars',status:'OPEN',ruleId:'SEC-002'},{id:'finding-2',fileName:'app.js',lineNumber:2,title:'Wildcard CORS policy',description:'desc',severity:'MEDIUM',category:'API_SECURITY',confidence:'HIGH',evidence:'*',recommendation:'Restrict origins',secureExample:'Use allowlist',status:'OPEN',ruleId:'API-001'}] };

function renderPath(path='/') { return render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MemoryRouter initialEntries={[path]}><App /></MemoryRouter></QueryClientProvider>); }

beforeEach(()=>{ vi.restoreAllMocks(); });

test('landing page renders',()=>{renderPath('/');expect(screen.getByText(/AI-assisted security reviews/)).toBeInTheDocument()});
test('new scan page renders',()=>{renderPath('/scans/new');expect(screen.getByText(/New Security Review/)).toBeInTheDocument()});

test('results page renders with mocked scan data', async()=>{ vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify(scan),{status:200,headers:{'Content-Type':'application/json'}})); renderPath('/scans/scan-1'); expect(await screen.findByText('Demo scan')).toBeInTheDocument(); expect(screen.getByText(/Risk score/)).toBeInTheDocument(); });

test('findings search and filters narrow rows', async()=>{ vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify(scan),{status:200,headers:{'Content-Type':'application/json'}})); renderPath('/scans/scan-1'); await screen.findByText('Hardcoded credential'); fireEvent.change(screen.getByLabelText('Search findings'),{target:{value:'cors'}}); expect(screen.queryByText('Hardcoded credential')).not.toBeInTheDocument(); expect(screen.getByText('Wildcard CORS policy')).toBeInTheDocument(); });

test('finding status update behavior', async()=>{ const fetchMock=vi.spyOn(globalThis,'fetch').mockImplementation(async (input, init)=> init?.method==='PATCH' ? new Response(null,{status:204}) : new Response(JSON.stringify(scan),{status:200,headers:{'Content-Type':'application/json'}})); renderPath('/scans/scan-1'); await screen.findByText('Hardcoded credential'); fireEvent.change(screen.getByLabelText('Update status for Hardcoded credential'),{target:{value:'REVIEWED'}}); await waitFor(()=>expect(fetchMock).toHaveBeenCalledWith('/api/scans/scan-1/findings/finding-1', expect.objectContaining({method:'PATCH'}))); });

test('API error state displays useful message', async()=>{ vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify({message:'Requested scan or finding was not found.'}),{status:404,headers:{'Content-Type':'application/json'}})); renderPath('/scans/missing'); expect(await screen.findByText(/Requested scan or finding was not found/)).toBeInTheDocument(); });
