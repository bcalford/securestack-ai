import { useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadBundle, downloadJsonReport, downloadSarif, reportUrl } from '../../api/client';
import ErrorState from '../ui/ErrorState';

export default function ReportActions({ scanId }: { scanId: string }) {
  const [exportError, setExportError] = useState('');
  const [isDownloadingSarif, setIsDownloadingSarif] = useState(false);
  const [isDownloadingJson, setIsDownloadingJson] = useState(false);
  const [isDownloadingBundle, setIsDownloadingBundle] = useState(false);

  async function handleSarifDownload() {
    setExportError('');
    setIsDownloadingSarif(true);
    try {
      await downloadSarif(scanId);
    } catch {
      setExportError('Unable to download SARIF export. Please try again.');
    } finally {
      setIsDownloadingSarif(false);
    }
  }


  async function handleJsonDownload() {
    setExportError('');
    setIsDownloadingJson(true);
    try {
      await downloadJsonReport(scanId);
    } catch {
      setExportError('Unable to download JSON export. Please try again.');
    } finally {
      setIsDownloadingJson(false);
    }
  }

  async function handleBundleDownload() {
    setExportError('');
    setIsDownloadingBundle(true);
    try {
      await downloadBundle(scanId);
    } catch {
      setExportError('Unable to download export bundle. Please try again.');
    } finally {
      setIsDownloadingBundle(false);
    }
  }

  return (
    <section className="card report-actions" aria-labelledby="export-heading">
      <h2 id="export-heading">Export report</h2>
      <p className="helper">Download a local copy of this review in the format you need.</p>

      <div className="grid cards">
        <div className="card subtle export-option">
          <h3>PDF report</h3>
          <p className="helper">Score, findings, remediation checklist, methodology, and limitations.</p>
          <a className="btn" href={reportUrl(scanId)}>Export PDF report</a>
        </div>

        <div className="card subtle export-option">
          <h3>SARIF</h3>
          <p className="helper">Hardened SARIF 2.1.0 JSON for import into code scanning tools.</p>
          <button className="btn secondary" type="button" onClick={handleSarifDownload} disabled={isDownloadingSarif}>
            {isDownloadingSarif ? 'Preparing SARIF...' : 'Download SARIF'}
          </button>
        </div>

        <div className="card subtle export-option">
          <h3>JSON</h3>
          <p className="helper">Full structured scan data for local tooling or automation.</p>
          <button className="btn secondary" type="button" onClick={handleJsonDownload} disabled={isDownloadingJson}>
            {isDownloadingJson ? 'Preparing JSON...' : 'Download JSON'}
          </button>
        </div>

        <div className="card subtle export-option">
          <h3>Bundle</h3>
          <p className="helper">ZIP containing the generated reports for handoff or archival.</p>
          <button className="btn secondary" type="button" onClick={handleBundleDownload} disabled={isDownloadingBundle}>
            {isDownloadingBundle ? 'Preparing bundle...' : 'Download bundle'}
          </button>
        </div>
      </div>

      <p className="actions">
        <Link className="btn secondary" to="/scans/new">Start another review</Link>
      </p>
      {exportError && <ErrorState>{exportError}</ErrorState>}
    </section>
  );
}
