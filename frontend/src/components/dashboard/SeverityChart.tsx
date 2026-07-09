import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const severityColors = ['#dc2626', '#c2410c', '#a16207', '#15803d', '#475569'];

export default function SeverityChart({ counts }: { counts: Record<string, number> }) {
  const chart = Object.entries(counts).map(([name, value]) => ({ name, value }));

  if (!chart.length) {
    return <div className="card" role="status">No severity data yet.</div>;
  }

  const summary = chart.map(entry => `${entry.name}: ${entry.value}`).join(', ');

  return (
    <div className="card chart-card">
      <h3>Severity breakdown</h3>
      <p id="severity-chart-summary" className="visually-hidden">Severity breakdown chart summary: {summary}.</p>
      <div className="chart-card-body">
        <div className="chart-graphic" role="img" aria-labelledby="severity-chart-summary">
          <ResponsiveContainer height={170} minWidth={160}>
          <PieChart>
            <Pie data={chart} dataKey="value" nameKey="name" innerRadius={38} outerRadius={72}>
              {chart.map((entry, index) => (
                <Cell key={entry.name} fill={severityColors[index % severityColors.length]} />
              ))}
            </Pie>
          </PieChart>
          </ResponsiveContainer>
        </div>
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
