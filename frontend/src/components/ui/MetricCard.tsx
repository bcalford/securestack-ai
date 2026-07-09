import type { ReactNode } from 'react';

type MetricCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
};

export default function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="card metric-card">
      <h3>{label}</h3>
      <p className="metric-value">{value}</p>
      {hint && <p className="helper">{hint}</p>}
    </div>
  );
}
