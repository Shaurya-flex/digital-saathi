'use client';

/* Review + dispute modals, reachable from any task card via a tiny bus
   (same pattern as the toast). AppBoot mounts <ModalHost/> once. */

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { getDB, me, taskById, toast, track, uid, now, mutate } from '@/lib/store';
import { setStatus } from '@/lib/engine/taskEngine';

export type ModalRequest =
  | { kind: 'review'; taskId?: string | null; providerId?: string | null }
  | { kind: 'dispute'; taskId?: string | null };

const listeners = new Set<(r: ModalRequest) => void>();
export function openReview(taskId?: string | null, providerId?: string | null) {
  listeners.forEach((l) => l({ kind: 'review', taskId, providerId }));
}
export function openDispute(taskId?: string | null) {
  listeners.forEach((l) => l({ kind: 'dispute', taskId }));
}

export function ModalHost() {
  const [req, setReq] = useState<ModalRequest | null>(null);
  useEffect(() => {
    const fn = (r: ModalRequest) => setReq(r);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  if (!req) return null;
  const close = () => setReq(null);
  return req.kind === 'review'
    ? <ReviewModal taskId={req.taskId} providerId={req.providerId} onClose={close} />
    : <DisputeModal taskId={req.taskId} onClose={close} />;
}

function ReviewModal({ taskId, providerId, onClose }: { taskId?: string | null; providerId?: string | null; onClose: () => void }) {
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  const submit = () => {
    mutate((db) => {
      const u = me();
      if (!u) return;
      const t = taskId ? taskById(taskId) : null;
      const pid = providerId || t?.assigned_provider || t?.data.pick;
      if (pid && db.providers.some((p) => p.id === pid)) {
        db.reviews.unshift({ id: uid('r'), userId: u.id, providerId: pid, taskId: taskId || null, stars, text, at: now() });
      }
      if (t) t.data.reviewed = true;
      track('review_submitted', { stars });
    });
    onClose();
    toast('Thanks for the rating.', 'ok');
  };
  return (
    <Modal onClose={onClose}>
      <h3>How did it go?</h3>
      <p className="small muted">Was the task completed as you expected?</p>
      <div className="row">
        {[5, 4, 3, 2, 1].map((n) => (
          <label key={n} className="chip">
            <input type="radio" name="stars" checked={stars === n} onChange={() => setStars(n)}
              style={{ width: 'auto', minHeight: 'auto' }} /> {'★'.repeat(n)}
          </label>
        ))}
      </div>
      <label className="f">Anything to add?</label>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <div className="row mt">
        <button className="btn" onClick={submit}>Submit rating</button>
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

function DisputeModal({ taskId, onClose }: { taskId?: string | null; onClose: () => void }) {
  const [type, setType] = useState('Task not completed');
  const [text, setText] = useState('');
  const submit = () => {
    mutate((db) => {
      const u = me();
      if (!u) return;
      db.disputes.unshift({ id: uid('dp'), userId: u.id, taskId: taskId || null, type, text, status: 'Open', at: now() });
      if (taskId) {
        const t = taskById(taskId);
        if (t) setStatus(t, 'Refund requested', 'Dispute raised');
      }
    });
    onClose();
    toast('Reported. Our team will review it.', 'ok');
  };
  return (
    <Modal onClose={onClose}>
      <h3>Report a problem</h3>
      <label className="f">What went wrong?</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        {['Task not completed', 'Wrong service', 'Late arrival', 'Payment issue', 'Provider behaviour'].map((o) => <option key={o}>{o}</option>)}
      </select>
      <label className="f">Tell us more</label>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <div className="row mt">
        <button className="btn" onClick={submit}>Submit</button>
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* "Change something" modal — redoes the plan with the user's tweak. */
export function ModifyModal({ taskId, onClose, onModify }: {
  taskId: string; onClose: () => void; onModify: (text: string) => void;
}) {
  const [val, setVal] = useState('');
  return (
    <Modal onClose={onClose}>
      <h3>Change something</h3>
      <p className="small muted">Tell Saathi what to change and it will redo the plan.</p>
      <input type="text" value={val} onChange={(e) => setVal(e.target.value)}
        placeholder="e.g. cheaper plan, earlier slot, someone closer" autoFocus />
      <div className="row mt">
        <button className="btn" onClick={() => {
          onClose();
          if (val.trim()) {
            const t = taskById(taskId);
            if (t) mutate(() => { t.audit_log.push({ at: now(), by: getDB().session || 'system', action: 'User changed the request', detail: val }); });
            toast('Updated the request.');
            onModify(val.trim());
          }
        }}>Update</button>
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
