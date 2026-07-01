import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createGitHubScan, createScan } from '../../api/client';
import { demoSamples, getDemoSample } from '../../data/demoSamples';
import type { PastedFile } from '../../types';
import FocusAreaSelector from './FocusAreaSelector';
import PastedFileEditor from './PastedFileEditor';

type ScanInputMode = 'paste' | 'upload' | 'sample' | 'github';

const emptyPastedFile: PastedFile = {
  fileName: 'app.js',
  fileType: 'js',
  content: '',
};

function validPastedFiles(files: PastedFile[]) {
  return files.filter(file => file.fileName.trim() && file.content.trim());
}

function isValidGitHubRepositoryUrl(value: string) {
  try {
    const url = new URL(value);
    const parts = url.pathname.split('/').filter(Boolean);
    return url.protocol === 'https:'
      && url.hostname.toLowerCase() === 'github.com'
      && !url.username
      && !url.password
      && (parts.length === 2 || (parts.length >= 4 && parts[2] === 'tree'))
      && parts.every(part => part !== '..' && part !== '.');
  } catch {
    return false;
  }
}

export default function ScanForm() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const initialSample = useMemo(() => getDemoSample(params.get('sample')), [params]);
  const startsWithSample = params.has('sample');

  const [mode, setMode] = useState<ScanInputMode>(startsWithSample ? 'sample' : 'paste');
  const [selectedSample, setSelectedSample] = useState(initialSample.id);
  const [files, setFiles] = useState<PastedFile[]>(startsWithSample ? initialSample.files : [emptyPastedFile]);
  const [depth, setDepth] = useState(initialSample.recommendedDepth);
  const [githubUrl, setGithubUrl] = useState('');
  const [err, setErr] = useState('');

  const sample = getDemoSample(selectedSample);
  const validFiles = validPastedFiles(files);
  const visiblePastedFiles = mode === 'upload' ? [] : files;

  function applySample(id: string) {
    const next = getDemoSample(id);
    setSelectedSample(id);
    setDepth(next.recommendedDepth);
    setFiles(next.files);
    setMode('sample');
  }

  function switchMode(nextMode: ScanInputMode) {
    setMode(nextMode);
    setErr('');

    if (nextMode === 'sample') {
      applySample(selectedSample);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErr('');

    const uploadInput = event.currentTarget.elements.namedItem('files') as HTMLInputElement | null;
    const uploadCount = uploadInput?.files?.length ?? 0;

    if (mode === 'github') {
      const trimmedUrl = githubUrl.trim();
      if (!isValidGitHubRepositoryUrl(trimmedUrl)) {
        setErr('Enter a valid public GitHub repository URL, such as https://github.com/owner/repo.');
        return;
      }

      const formData = new FormData(event.currentTarget);
      try {
        const response = await createGitHubScan({
          repositoryUrl: trimmedUrl,
          scanName: String(formData.get('scanName') || 'GitHub repository review'),
          reviewDepth: depth,
          focusAreas: formData.getAll('focusAreas').map(String).join(','),
        });
        nav(`/scans/${response.scanId}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (/download|import|fetch|archive/i.test(message)) {
          setErr('GitHub repository download failed. Confirm the public repository exists and try again.');
        } else {
          setErr('GitHub repository validation failed. Confirm the URL points to a supported public GitHub repository.');
        }
      }
      return;
    }

    if (validFiles.length === 0 && uploadCount === 0) {
      setErr('Add at least one valid pasted, uploaded, sample, or GitHub URL input before running the review.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.delete('generatePdf');
    formData.set('pastedFiles', JSON.stringify(validFiles));
    formData.set('reviewDepth', depth);

    try {
      const response = await createScan(formData);
      nav(`/scans/${response.scanId}`);
    } catch {
      setErr('Review creation failed. Confirm the backend is running and the selected files meet size and type limits.');
    }
  }

  return (
    <form onSubmit={submit} className="review-form">
      <section className="card">
        <h2>Step 1: Name the review</h2>
        <label>
          Review name
          <input
            className="input"
            name="scanName"
            defaultValue={mode === 'sample' ? sample.name : 'Portfolio API review'}
          />
        </label>
        <p className="helper">Use a descriptive name, such as “Portfolio API review” or “Docker/IaC sample review.”</p>
      </section>

      <section className="card">
        <h2>Step 2: Add files</h2>
        <p className="helper">
          Choose pasted source, local uploads, safe demo samples, or a public GitHub repository URL. Demo fixtures are intentionally vulnerable and use fake secrets only.
        </p>

        <div className="tab-row" aria-label="File input mode">
          <button type="button" className={`btn ${mode === 'paste' ? '' : 'secondary'}`} onClick={() => switchMode('paste')}>
            Paste files
          </button>
          <button type="button" className={`btn ${mode === 'upload' ? '' : 'secondary'}`} onClick={() => switchMode('upload')}>
            Upload files
          </button>
          <button type="button" className={`btn ${mode === 'sample' ? '' : 'secondary'}`} onClick={() => switchMode('sample')}>
            Use sample
          </button>
          <button type="button" className={`btn ${mode === 'github' ? '' : 'secondary'}`} onClick={() => switchMode('github')}>
            GitHub URL
          </button>
        </div>

        {mode === 'sample' && (
          <div className="mode-panel">
            <label>
              Sample review
              <select value={selectedSample} onChange={event => applySample(event.target.value)}>
                {demoSamples.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </label>
            <p className="helper">{sample.description}</p>
            <p className="helper">Preloaded files: {sample.files.map(file => file.fileName).join(', ')}</p>
          </div>
        )}

        {mode === 'upload' && (
          <div className="mode-panel">
            <label>
              Upload files or ZIP
              <input className="input" type="file" name="files" multiple />
            </label>
            <p className="helper">
              Upload source, configuration, or ZIP files. Blank pasted placeholders are ignored,
              so upload mode only submits selected uploads unless you already added real pasted content.
            </p>
            {validFiles.length > 0 && (
              <p className="helper">Also submitting {validFiles.length} pasted file(s) already added in paste mode.</p>
            )}
          </div>
        )}

        {mode === 'github' && (
          <div className="mode-panel">
            <label>
              Public GitHub repository URL
              <input
                className="input"
                name="repositoryUrl"
                type="url"
                value={githubUrl}
                onChange={event => setGithubUrl(event.target.value)}
                placeholder="https://github.com/owner/repo"
              />
            </label>
            <ul className="helper">
              <li>Public GitHub repositories only; private repositories are not supported.</li>
              <li>Analysis runs locally after import. No token is needed.</li>
              <li>Uploaded or imported code is not executed.</li>
            </ul>
          </div>
        )}

        {mode === 'paste' && (
          <p className="helper">Paste one or more source/config files. Blank placeholder rows are ignored.</p>
        )}

        {mode !== 'upload' && mode !== 'github' && (
          <>
            <PastedFileEditor files={visiblePastedFiles} setFiles={setFiles} />
            <button
              type="button"
              className="btn secondary"
              onClick={() => setFiles(current => [...current, { fileName: 'config.tf', fileType: 'tf', content: '' }])}
            >
              Add another pasted file
            </button>
          </>
        )}
      </section>

      <section className="card">
        <h2>Step 3: Configure review</h2>
        <label>
          Review depth
          <select name="reviewDepth" value={depth} onChange={event => setDepth(event.target.value as typeof depth)}>
            <option>QUICK</option>
            <option>STANDARD</option>
            <option>FULL</option>
          </select>
        </label>
        <ul className="helper">
          <li><b>QUICK:</b> Prioritizes critical and high-risk signals.</li>
          <li><b>STANDARD:</b> Balanced review for most demos.</li>
          <li><b>FULL:</b> Runs the broadest set of checks.</li>
        </ul>
        <FocusAreaSelector />
        <p className="card subtle">Mock AI is used by default. Bedrock summaries appear only when the backend is manually started with AI_PROVIDER=bedrock.</p>
      </section>

      <section className="card">
        <h2>Step 4: Run review</h2>
        <p>
          <b>Ready:</b> {mode === 'github' ? (githubUrl.trim() ? 'GitHub URL provided' : 'waiting for GitHub URL') : `${validFiles.length} pasted/sample file(s)`}
          {mode === 'upload' ? ' plus selected uploads' : ''} · {mode === 'sample' ? sample.name : mode === 'github' ? 'public repository import' : 'manual input'} · {depth} depth.
        </p>
        <p className="helper">PDF export is available from the results page after the review is created.</p>
        <p><button className="btn">Run security review</button></p>
        {err && <p className="error" role="alert">{err}</p>}
      </section>
    </form>
  );
}
