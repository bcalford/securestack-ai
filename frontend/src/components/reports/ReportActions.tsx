import { useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadSarif, reportUrl } from '../../api/client';

export default function ReportActions({ scanId }: { scanId: string }) {
  const [sarifError, setSarifError] = useState('');
  const [isDownloadingSarif, setIsDownloadingSarif] = useState(false);

  async function handleSarifDownload() {
    setSarifError('');
    setIsDownloadingSarif(true);
    try {
      await downloadSarif(scanId);
    } catch {
      setSarifError('Unable to download SARIF export. Please try again.');
    } finally {
      setIsDownloadingSarif(false);
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
      <Link className="btn secondary" to="/scans/new">Start another review</Link>
      {sarifError && <p className="error" role="alert">{sarifError}</p>}
    </section>
  );
}
