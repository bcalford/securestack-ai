import ScanForm from '../components/scan/ScanForm';
import PageHeader from '../components/ui/PageHeader';

export default function NewScanPage() {
  return (
    <main className="container">
      <PageHeader title="New Security Review" />
      <ScanForm />
    </main>
  );
}
