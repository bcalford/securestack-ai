import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listRules } from '../api/client';
import type { RuleCatalogItem } from '../types';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import LoadingState from '../components/ui/LoadingState';
import PageHeader from '../components/ui/PageHeader';
import SeverityBadge from '../components/ui/SeverityBadge';
import StatusBadge from '../components/ui/StatusBadge';

export default function RuleCatalogPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const { data = [], error, isLoading } = useQuery<RuleCatalogItem[]>({ queryKey: ['rules'], queryFn: listRules });
  const normalized = query.trim().toLowerCase();
  const hasActiveFilters = Boolean(query || category || severity);

  function clearFilters() {
    setQuery('');
    setCategory('');
    setSeverity('');
  }

  const categories = useMemo(() => Array.from(new Set(data.map((rule) => rule.category))).sort(), [data]);
  const rules = useMemo(
    () => data
      .filter((rule) => !category || rule.category === category)
      .filter((rule) => !severity || rule.severity === severity)
      .filter((rule) => [
        rule.id,
        rule.title,
        rule.category,
        rule.severity,
        rule.description,
        rule.recommendation,
        ...(rule.controlMappings ?? []).map((mapping) => `${mapping.framework} ${mapping.value}`),
      ].join(' ').toLowerCase().includes(normalized)),
    [category, data, normalized, severity],
  );

  return (
    <main className="container">
      <PageHeader
        eyebrow="Static analysis"
        title="Rule Catalog"
        description="Review the deterministic checks SecureStack AI runs against uploaded or pasted files. Rules are defensive, local-first, and sorted by stable rule ID."
      />

      <div className="filters" aria-label="Rule catalog filters">
        <label htmlFor="rule-search">Search rules
          <input id="rule-search" className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rule ID, title, mapping, or recommendation" />
        </label>
        <label htmlFor="rule-category">Filter category
          <select id="rule-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label htmlFor="rule-severity">Filter severity
          <select id="rule-severity" value={severity} onChange={(event) => setSeverity(event.target.value)}>
            <option value="">All severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
            <option value="INFO">INFO</option>
          </select>
        </label>
      </div>

      {isLoading && <LoadingState>Loading rule catalog…</LoadingState>}
      {error && <ErrorState>Unable to load rule catalog.</ErrorState>}
      {!isLoading && !error && data.length === 0 && <EmptyState>No rules are currently published in the catalog.</EmptyState>}
      {!isLoading && !error && data.length > 0 && rules.length === 0 && (
        <EmptyState>
          No rules match your filter.
          {hasActiveFilters && (
            <>
              {' '}
              <button type="button" className="btn secondary" onClick={clearFilters}>Clear filters</button>
            </>
          )}
        </EmptyState>
      )}
      {!isLoading && !error && data.length > 0 && rules.length > 0 && (
        <p className="helper">Showing {rules.length} of {data.length} rule(s).</p>
      )}

      <section className="grid" aria-label="Rules">
        {rules.map((rule) => (
          <article className="card" key={rule.id}>
            <div className="finding-head">
              <div>
                <p className="eyebrow">{rule.id}</p>
                <h2>{rule.title}</h2>
              </div>
              <SeverityBadge severity={rule.severity} />
            </div>
            <p>
              <span className="badge badge-neutral">Category: {rule.category}</span>
              {rule.confidence && <StatusBadge label={`Confidence: ${rule.confidence}`} />}
            </p>
            <p>{rule.description}</p>
            <p><strong>Recommendation:</strong> {rule.recommendation}</p>
            {!!rule.controlMappings?.length && (
              <p className="helper">
                <strong>Mappings:</strong> {rule.controlMappings.map((mapping) => `${mapping.framework}: ${mapping.value}`).join(' | ')}
              </p>
            )}
            {rule.reviewDepthBehavior && <p className="helper"><strong>Review depth:</strong> {rule.reviewDepthBehavior}</p>}
            {rule.falsePositiveNote && <p className="helper"><strong>False-positive note:</strong> {rule.falsePositiveNote}</p>}
          </article>
        ))}
      </section>
    </main>
  );
}
