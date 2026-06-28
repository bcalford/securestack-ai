import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createScan } from '../../api/client';
import { demoSamples, getDemoSample } from '../../data/demoSamples';
import type { PastedFile } from '../../types';
import FocusAreaSelector from './FocusAreaSelector';
import PastedFileEditor from './PastedFileEditor';

export default function ScanForm() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const initialSample = useMemo(() => getDemoSample(params.get('sample')), [params]);
  const [mode, setMode] = useState<'paste'|'upload'|'sample'>(params.has('sample') ? 'sample' : 'paste');
  const [selectedSample, setSelectedSample] = useState(initialSample.id);
  const sample = getDemoSample(selectedSample);
  const [files, setFiles] = useState<PastedFile[]>(params.has('sample') ? initialSample.files : [{ fileName: 'app.js', fileType: 'js', content: '' }]);
  const [depth, setDepth] = useState(initialSample.recommendedDepth);
  const [err, setErr] = useState('');

  function applySample(id: string) { const next = getDemoSample(id); setSelectedSample(id); setDepth(next.recommendedDepth); setFiles(next.files); setMode('sample'); }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr('');
    const hasPasted = files.some(f => f.fileName.trim() && f.content.trim());
    const upload = (e.currentTarget.elements.namedItem('files') as HTMLInputElement | null)?.files;
    if (!hasPasted && (!upload || upload.length === 0)) { setErr('Add at least one pasted, uploaded, or sample file before running the review.'); return; }
    const fd = new FormData(e.currentTarget); fd.set('pastedFiles', JSON.stringify(files)); fd.set('reviewDepth', depth);
    try { const r = await createScan(fd); nav(`/scans/${r.scanId}`); } catch { setErr('Review creation failed. Confirm the backend is running and the selected files meet size and type limits.'); }
  }

  return <form onSubmit={submit} className="review-form">
    <section className="card"><h2>Step 1: Name the review</h2><label>Review name<input className="input" name="scanName" defaultValue={mode === 'sample' ? sample.name : 'Portfolio API review'} /></label><p className="helper">Use a descriptive name, such as “Portfolio API review” or “Docker/IaC sample review.”</p></section>
    <section className="card"><h2>Step 2: Add files</h2><p className="helper">Use safe demo files to see how SecureStack AI prioritizes findings. These are intentionally vulnerable examples, not real credentials.</p><div className="tab-row"><button type="button" className={`btn ${mode==='paste'?'':'secondary'}`} onClick={()=>setMode('paste')}>Paste files</button><button type="button" className={`btn ${mode==='upload'?'':'secondary'}`} onClick={()=>setMode('upload')}>Upload files</button><button type="button" className={`btn ${mode==='sample'?'':'secondary'}`} onClick={()=>setMode('sample')}>Use sample</button></div>{mode==='sample' && <div><label>Sample review<select value={selectedSample} onChange={e=>applySample(e.target.value)}>{demoSamples.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><p className="helper">{sample.description}</p></div>}<PastedFileEditor files={files} setFiles={setFiles}/><button type="button" className="btn secondary" onClick={()=>setFiles([...files,{fileName:'config.tf',fileType:'tf',content:''}])}>Add another pasted file</button>{mode==='upload' && <label>Upload files or ZIP<input className="input" type="file" name="files" multiple/></label>}</section>
    <section className="card"><h2>Step 3: Configure review</h2><label>Review depth<select name="reviewDepth" value={depth} onChange={e=>setDepth(e.target.value as typeof depth)}><option>QUICK</option><option>STANDARD</option><option>FULL</option></select></label><ul className="helper"><li><b>QUICK:</b> Prioritizes critical and high-risk signals.</li><li><b>STANDARD:</b> Balanced review for most demos.</li><li><b>FULL:</b> Runs the broadest set of checks.</li></ul><FocusAreaSelector/><p className="card subtle">Mock AI is used by default. Bedrock summaries appear only when the backend is manually started with AI_PROVIDER=bedrock.</p></section>
    <section className="card"><h2>Step 4: Run review</h2><p><b>Ready:</b> {files.length} file(s) · {mode==='sample' ? sample.name : 'manual input'} · {depth} depth.</p><label><input type="checkbox" name="generatePdf" defaultChecked/> Generate PDF automatically</label><p><button className="btn">Run security review</button></p>{err&&<p className="error" role="alert">{err}</p>}</section>
  </form>;
}
