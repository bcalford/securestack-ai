import { useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadBundle, downloadJsonReport, downloadSarif, reportUrl } from '../../api/client';
import ErrorState from '../ui/ErrorState';
import ExportCard from '../ui/ExportCard';
import SectionHeader from '../ui/SectionHeader';

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
      <SectionHeader
        headingId="export-heading"
        eyebrow="Export center"
        title="Export report"
        description="Download a local copy of this review in the format you need."
      />

      <div className="export-grid">
        <ExportCard
          title="PDF report"
          description="Score, findings, remediation checklist, methodology, and limitations."
          action={<a className="btn" href={reportUrl(scanId)}>Export PDF report</a>}
        />

        <ExportCard
          title="SARIF"
          description="Hardened SARIF 2.1.0 JSON for import into code scanning tools."
          action={(
            <button className="btn secondary" type="button" onClick={handleSarifDownload} disabled={isDownloadingSarif}>
              {isDownloadingSarif ? 'Preparing SARIF...' : 'Download SARIF'}
            </button>
          )}
        />

        <ExportCard
          title="JSON"
          description="Full structured scan data for local tooling or automation."
          action={(
            <button className="btn secondary" type="button" onClick={handleJsonDownload} disabled={isDownloadingJson}>
              {isDownloadingJson ? 'Preparing JSON...' : 'Download JSON'}
            </button>
          )}
        />

        <ExportCard
          title="Bundle"
          description="ZIP containing the generated reports for handoff or archival."
          action={(
            <button className="btn secondary" type="button" onClick={handleBundleDownload} disabled={isDownloadingBundle}>
              {isDownloadingBundle ? 'Preparing bundle...' : 'Download bundle'}
            </button>
          )}
        />
      </div>

      <p className="actions">
        <Link className="btn secondary" to="/scans/new">Start another review</Link>
      </p>
      {exportError && <ErrorState>{exportError}</ErrorState>}
    </section>
  );
}
