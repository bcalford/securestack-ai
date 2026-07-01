import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listRules } from '../api/client';
import type { RuleCatalogItem } from '../types';

export default function RuleCatalogPage() {
  const [query, setQuery] = useState('');
  const { data = [], error, isLoading } = useQuery<RuleCatalogItem[]>({ queryKey: ['rules'], queryFn: listRules });
  const normalized = query.trim().toLowerCase();
  const rules = useMemo(
    () => data.filter((rule) => [rule.id, rule.title, rule.category, rule.severity, rule.description, rule.recommendation].join(' ').toLowerCase().includes(normalized)),
    [data, normalized],
  );

  return (
    <main className="container">
      <p className="eyebrow">Static analysis</p>
      <h1>Rule Catalog</h1>
      <p className="lede">Review the deterministic checks SecureStack AI runs against uploaded or pasted files. Rules are defensive, local-first, and sorted by stable rule ID.</p>

      <label htmlFor="rule-search">Search rules</label>
      <input id="rule-search" className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by rule ID, category, severity, or recommendation" />

      {isLoading && <p>Loading rule catalog…</p>}
      {error && <p className="error" role="alert">Unable to load rule catalog.</p>}
      {!isLoading && !error && data.length === 0 && <p className="card">No rules are currently published in the catalog.</p>}
      {!isLoading && !error && data.length > 0 && rules.length === 0 && <p className="card">No rules match your filter.</p>}

      <section className="grid" aria-label="Rules">
        {rules.map((rule) => (
          <article className="card" key={rule.id}>
            <div className="finding-head">
              <div>
                <p className="eyebrow">{rule.id}</p>
                <h2>{rule.title}</h2>
              </div>
              <span className={`badge sev-${rule.severity}`}>{rule.severity}</span>
            </div>
            <p><strong>Category:</strong> {rule.category}</p>
            <p>{rule.description}</p>
            <p><strong>Recommendation:</strong> {rule.recommendation}</p>
            {rule.reviewDepthBehavior && <p className="helper"><strong>Review depth:</strong> {rule.reviewDepthBehavior}</p>}
          </article>
        ))}
      </section>
    </main>
  );
}
