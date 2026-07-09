import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const severityColors = ['#dc2626', '#c2410c', '#a16207', '#15803d', '#475569'];

export default function SeverityChart({ counts }: { counts: Record<string, number> }) {
  const chart = Object.entries(counts).map(([name, value]) => ({ name, value }));

  if (!chart.length) {
    return <div className="card">No severity data yet.</div>;
  }

  return (
    <div className="card chart-card">
      <h3>Severity breakdown</h3>
      <div className="chart-card-body">
        <ResponsiveContainer height={170} minWidth={160}>
          <PieChart>
            <Pie data={chart} dataKey="value" nameKey="name" innerRadius={38} outerRadius={72}>
              {chart.map((entry, index) => (
                <Cell key={entry.name} fill={severityColors[index % severityColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <ul className="chart-legend" aria-label="Severity counts">
          {chart.map((entry, index) => (
            <li key={entry.name}>
              <span
                className="chart-legend-swatch"
                style={{ backgroundColor: severityColors[index % severityColors.length] }}
                aria-hidden="true"
              />
              <span>{entry.name}</span>
              <strong>{entry.value}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
