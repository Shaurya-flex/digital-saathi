import { ReactNode } from 'react';

/* Product rule 6: simulated transactions are always labelled. */
export function DemoFlag({ children }: { children?: ReactNode }) {
  return <span className="demoflag">{children || 'Demo — integration required'}</span>;
}
