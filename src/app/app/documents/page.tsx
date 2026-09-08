'use client';

/* Document vault: categorised, AI summarise, per-task sharing, delete.
   Privacy statement up top; nothing uploads automatically. */

import { useState } from 'react';
import { CustomerShell } from '@/components/layout/Shell';
import { Modal } from '@/components/ui/Modal';
import { useDB } from '@/hooks/useDB';
import { me, mutate, now, speakNow, toast, uid } from '@/lib/store';
import type { Doc } from '@/lib/types';

const CATS = ['Identity', 'Travel', 'Education', 'Insurance', 'Finance', 'Medical', 'Property', 'Employment', 'Other'];

export default function DocumentsPage() {
  const { db, ready } = useDB();
  const [showDoc, setShowDoc] = useState<Doc | null>(null);
  const u = ready ? me() : null;

  const body = !u || !db ? null : (() => {
    const docs = db.documents.filter((d) => d.userId === u.id);
    return (
      <>
        <div className="between">
          <h2 style={{ margin: 0 }}>Document vault</h2>
          <button className="btn sm" onClick={() => {
            mutate((d) => {
              d.documents.unshift({ id: uid('d'), userId: u.id, name: 'New document.pdf', cat: 'Other', size: '—',
                added: now(), expiry: '', summary: 'Not read yet. File storage is not connected in this demo build.' });
            });
            toast('Added a placeholder. Storage adapter required.', 'warn');
          }}>Add a document</button>
        </div>
        <div className="card mt" style={{ background: 'var(--indigo-soft)', borderColor: '#c9cee9' }}>
          <strong>Your documents stay yours</strong>
          <p className="small" style={{ margin: '.3rem 0 0' }}>
            Nothing here is uploaded to any service automatically. When a task needs a document, Saathi asks you first,
            for that one task. Delete anything at any time.
          </p>
        </div>
        <div className="chips mt">
          {CATS.map((c) => (
            <span key={c} className="chip" style={{ cursor: 'default' }}>
              {c} <span className="muted">{docs.filter((d) => d.cat === c).length}</span>
            </span>
          ))}
        </div>
        <div className="grid g2 mt">
          {docs.length ? docs.map((d) => (
            <div key={d.id} className="card">
              <div className="between"><strong>{d.name}</strong><span className="tag plain">{d.cat}</span></div>
              <p className="small muted" style={{ margin: '.4rem 0' }}>{d.summary}</p>
              {d.expiry ? <span className="tag warm">Renew by {d.expiry}</span> : null}
              <div className="row mt">
                <button className="btn ghost sm" onClick={() => setShowDoc(d)}>Explain simply</button>
                <button className="btn ghost sm" onClick={() => toast('Sharing is per task and needs your approval each time.')}>Share for one task</button>
                <button className="linkish small" onClick={() => { mutate((x) => { x.documents = x.documents.filter((y) => y.id !== d.id); }); toast('Deleted.'); }}>Delete</button>
              </div>
            </div>
          )) : <div className="card muted">Vault is empty.</div>}
        </div>
        {showDoc ? (
          <Modal onClose={() => setShowDoc(null)}>
            <h3>{showDoc.name}</h3>
            <p>{showDoc.summary}</p>
            <div className="row">
              <button className="btn ghost" onClick={() => speakNow(showDoc.summary)}>Read aloud</button>
              <button className="btn" onClick={() => setShowDoc(null)}>Close</button>
            </div>
          </Modal>
        ) : null}
      </>
    );
  })();
  return <CustomerShell active="documents">{body}</CustomerShell>;
}
