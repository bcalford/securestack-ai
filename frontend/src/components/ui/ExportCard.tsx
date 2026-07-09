import type { ReactNode } from 'react';

type ExportCardProps = {
  title: string;
  description: string;
  action: ReactNode;
};

export default function ExportCard({ title, description, action }: ExportCardProps) {
  return (
    <div className="export-card">
      <h3>{title}</h3>
      <p className="helper">{description}</p>
      <div className="export-card-action">{action}</div>
    </div>
  );
}
