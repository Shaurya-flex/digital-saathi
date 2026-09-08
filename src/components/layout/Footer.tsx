import Link from 'next/link';

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="between">
          <div>
            <div className="brand" style={{ color: '#fff' }}><span className="mark">डि</span> Digital Saathi</div>
            <p className="small" style={{ maxWidth: '38ch', color: '#a9abbb' }}>
              Aap bas boliye. Digital aur daily kaam hum sambhalenge.
            </p>
          </div>
          <div className="row" style={{ gap: '2rem', alignItems: 'flex-start' }}>
            <div>
              <p className="small" style={{ color: '#fff', fontWeight: 700 }}>Product</p>
              <p className="small">
                <Link href="/login">Open app</Link><br />
                <Link href="/#pricing">Pricing</Link><br />
                <Link href="/learn">Learn</Link>
              </p>
            </div>
            <div>
              <p className="small" style={{ color: '#fff', fontWeight: 700 }}>Partners</p>
              <p className="small">
                <Link href="/partner">Service partner</Link><br />
                <Link href="/become-agent">Digital agent</Link><br />
                <Link href="/admin/overview">Admin</Link>
              </p>
            </div>
          </div>
        </div>
        <p className="tiny" style={{ color: '#8f92a3', marginTop: '1.6rem' }}>
          Prototype build. Not affiliated with any government body. Simulated transactions are labelled
          “Demo — integration required”. Part of the Moodily projects.
        </p>
      </div>
    </footer>
  );
}
