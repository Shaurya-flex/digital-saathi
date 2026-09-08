import { CSSProperties, ReactNode } from 'react';

export function StatCard({ label, value, sub, valueStyle }: {
  label: ReactNode; value: ReactNode; sub?: ReactNode; valueStyle?: CSSProperties;
}) {
  return (
    <div className="stat">
      <span className="small muted">{label}</span>
      <b style={valueStyle}>{value}</b>
      {sub ? <span className="tiny muted">{sub}</span> : null}
    </div>
  );
}
