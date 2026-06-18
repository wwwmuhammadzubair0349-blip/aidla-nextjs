"use client";
// components/ui/DataTable.jsx
// Reusable data table with loading skeleton, empty state, and optional row click.

import SkeletonTable from "@/components/SkeletonTable";
import EmptyState from "@/components/ui/EmptyState";

const CSS = `
.dt-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid #e2e8f0; }
.dt-table { width: 100%; border-collapse: collapse; font-family: 'DM Sans', system-ui, sans-serif; }
.dt-th {
  text-align: left;
  padding: 10px 14px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}
.dt-th:first-child { border-radius: 12px 0 0 0; }
.dt-th:last-child  { border-radius: 0 12px 0 0; }
.dt-td {
  padding: 11px 14px;
  font-size: 0.82rem;
  color: #0f172a;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.dt-row:last-child .dt-td { border-bottom: none; }
.dt-row-clickable { cursor: pointer; transition: background 0.12s; }
.dt-row-clickable:hover { background: #f8fafc; }
`;

export default function DataTable({ columns, data, loading, emptyState, onRowClick }) {
  if (loading) {
    return <SkeletonTable rows={5} />;
  }

  if (!data || data.length === 0) {
    return (
      emptyState || (
        <EmptyState
          icon="📋"
          title="No data yet"
          description="Items will appear here once available."
        />
      )
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="dt-wrap">
        <table className="dt-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="dt-th" style={col.width ? { width: col.width } : {}}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.id || i}
                className={`dt-row${onRowClick ? " dt-row-clickable" : ""}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="dt-td">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
