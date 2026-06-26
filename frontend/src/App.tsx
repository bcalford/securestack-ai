import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AboutPage from './routes/AboutPage';
import LandingPage from './routes/LandingPage';
import NewScanPage from './routes/NewScanPage';
import ResultsPage from './routes/ResultsPage';
import SampleReportPage from './routes/SampleReportPage';
import ScanHistoryPage from './routes/ScanHistoryPage';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/scans/new" element={<NewScanPage />} />
        <Route path="/scans/:id" element={<ResultsPage />} />
        <Route path="/scans" element={<ScanHistoryPage />} />
        <Route path="/sample-report" element={<SampleReportPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </AppLayout>
  );
}
