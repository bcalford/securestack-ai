import type {Scan} from '../types';
const API=import.meta.env.VITE_API_BASE_URL||'http://localhost:8080/api';
async function parseError(r:Response){try{return (await r.json()).message||r.statusText}catch{return r.statusText}}
export async function createScan(form:FormData){const r=await fetch(`${API}/scans`,{method:'POST',body:form});if(!r.ok)throw new Error(await parseError(r));return r.json() as Promise<{scanId:string}>}
export async function getScan(id:string){const r=await fetch(`${API}/scans/${id}`);if(!r.ok)throw new Error(await parseError(r));return r.json() as Promise<Scan>}
export async function listScans(){const r=await fetch(`${API}/scans`);if(!r.ok)throw new Error(await parseError(r));return r.json()}
export async function updateFindingStatus(scanId:string,findingId:string,status:string){const r=await fetch(`${API}/scans/${scanId}/findings/${findingId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});if(!r.ok)throw new Error(await parseError(r));}
export async function deleteScan(scanId:string){const r=await fetch(`${API}/scans/${scanId}`,{method:'DELETE'});if(!r.ok)throw new Error(await parseError(r));}
export const reportUrl=(id:string)=>`${API}/scans/${id}/report`;
