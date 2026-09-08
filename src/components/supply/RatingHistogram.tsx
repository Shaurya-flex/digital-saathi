'use client';

export function RatingHistogram({ hist }: { hist: Record<number, number> }) {
  const total = Object.values(hist).reduce((s, v) => s + v, 0) || 1;
  return (
    <div className="card">
      {[5, 4, 3, 2, 1].map((n) => {
        const c = hist[n] || 0;
        return (
          <div key={n} className="ratingbar">
            <span className="tiny">{n}★</span>
            <span className="rbtrack"><span style={{ width: Math.round((c / total) * 100) + '%' }} /></span>
            <span className="tiny">{c}</span>
          </div>
        );
      })}
    </div>
  );
}
