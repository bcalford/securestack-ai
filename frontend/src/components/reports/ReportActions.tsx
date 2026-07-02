import { useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadJsonReport, downloadSarif, reportUrl } from '../../api/client';

export default function ReportActions({ scanId }: { scanId: string }) {
  const [exportError, setExportError] = useState('');
  const [isDownloadingSarif, setIsDownloadingSarif] = useState(false);
  const [isDownloadingJson, setIsDownloadingJson] = useState(false);

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

  return (
    <section className="card report-actions">
      <h2>Export report</h2>
      <p>Includes score, findings, remediation checklist, methodology, and limitations.</p>
      <a className="btn" href={reportUrl(scanId)}>Export PDF report</a>{' '}
      <button className="btn secondary" type="button" onClick={handleSarifDownload} disabled={isDownloadingSarif}>
        {isDownloadingSarif ? 'Preparing SARIF...' : 'Download SARIF'}
      </button>{' '}
      <button className="btn secondary" type="button" onClick={handleJsonDownload} disabled={isDownloadingJson}>
        {isDownloadingJson ? 'Preparing JSON...' : 'Download JSON'}
      </button>{' '}
      <Link className="btn secondary" to="/scans/new">Start another review</Link>
      {exportError && <p className="error" role="alert">{exportError}</p>}
    </section>
  );
}
