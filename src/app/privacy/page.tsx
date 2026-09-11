import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What Digital Saathi collects (name, email, task content, documents you choose to share, optional location), why, who it is shared with, how long it is kept, and how to delete your data.',
  alternates: { canonical: '/privacy' },
};

export default function Privacy() {
  return (
    <>
      <main id="main" className="narrow" style={{ padding: '2.4rem 0 4rem' }}>
        <h1>Privacy Policy</h1>
        <p className="small muted">Last updated: 10 September 2026</p>

        <p>
          This page explains what Digital Saathi collects, why, and what you can do about it. We designed the
          product around a simple rule: nothing that costs money, touches a document, or shares your data with a
          human agent happens without your say-so first — the same rule applies to how we handle your data.
        </p>

        <h2>1. What we collect</h2>
        <ul>
          <li><strong>Account details</strong> — your name and email address, from Google sign-in or the email link
            you request. We never receive or store a password.</li>
          <li><strong>Profile details you add</strong> — phone number, city, preferred language, Easy Mode setting,
            and anything you choose to save to &ldquo;What Saathi remembers&rdquo; (for example your usual mobile
            operator or home address) so you do not have to repeat yourself. We explicitly ask you not to store
            Aadhaar, PAN or card numbers there, and we do not ask for them either.</li>
          <li><strong>Family members</strong> you add to your account (name, relation, phone) and the permissions
            you set for them — only added by you, for people you manage tasks for.</li>
          <li><strong>Task content</strong> — what you type or say to Saathi, the intent it detects, and the plan,
            options and result of each task, so the task can be carried out and so you have a record of what
            happened (&ldquo;What happened&rdquo; on every task).</li>
          <li><strong>Documents you upload</strong> to your vault, and the AI-generated summaries of them. These are
            never sent anywhere automatically — you choose, per task, whether to share one with a digital agent.</li>
          <li><strong>Location</strong>, only if you tap &ldquo;Use my location&rdquo; to see doorstep partners near
            you. We do not track location in the background.</li>
          <li><strong>Payment metadata</strong> — the amount, order ID and payment status from Razorpay. We do not
            receive or store your card number, UPI PIN or netbanking credentials; Razorpay handles those directly.</li>
          <li><strong>Usage events</strong> — which features you use and when (for example, a task was created or
            completed), so we can see what is working and fix what is not.</li>
          <li><strong>Local device storage</strong> — your session and app preferences are kept in your browser
            (localStorage) so the app works instantly; signed-in users also get an encrypted backup in our database
            so the same account works across devices.</li>
        </ul>

        <h2>2. What we use it for</h2>
        <ul>
          <li>To carry out the tasks you ask for and show you their status and history.</li>
          <li>To personalise responses using what you have chosen to save (for example, defaulting to your usual
            mobile operator).</li>
          <li>To match you with a nearby verified service partner or the right digital agent.</li>
          <li>To process payments and keep an accurate ledger of your credits and wallet.</li>
          <li>To provide support — if you report a problem or contact us, our team may look at the relevant task or
            account so we can actually help, and to review disputes.</li>
          <li>To improve the product — understanding where tasks fail or stall so we can fix the underlying flow.</li>
          <li>To meet legal and accounting obligations (for example, retaining payment records as Indian law
            requires).</li>
        </ul>
        <p className="small muted">
          We do not sell your personal data, and we do not use it to serve third-party advertising.
        </p>

        <h2>3. Who we share it with</h2>
        <ul>
          <li><strong>Service partners and digital agents</strong> — only the details needed to do the specific job
            you approved (for example, your address and the task description for a home visit), never your full
            profile or documents unless you explicitly share a document for that one task.</li>
          <li><strong>Razorpay</strong> — to process a payment you initiate.</li>
          <li><strong>Google</strong> — only to authenticate you; we receive your name and email, nothing else from
            your Google account.</li>
          <li><strong>Supabase</strong> — our database and authentication provider, which stores your account and
            backup data on our behalf under a data processing agreement, secured by row-level security so only your
            own account (and our authorised support team, for the purpose in section 2) can read it.</li>
          <li><strong>Law enforcement or regulators</strong>, only where we are legally required to.</li>
        </ul>

        <h2>4. Authorised access by our team</h2>
        <p>
          A small number of authorised Digital Saathi team members can, for support and product-improvement
          purposes only, view account data in a read-only view that mirrors what you see — for example, to diagnose
          a stuck task or a payment issue you have reported. This access is logged, restricted to named accounts,
          and is never used to take actions on your behalf (place an order, change a setting, message a partner)
          without your separate instruction.
        </p>

        <h2>5. How long we keep it</h2>
        <p>
          We keep your account data for as long as your account is active, plus a limited period afterward for
          legal, accounting and fraud-prevention purposes (typically up to 12 months for task and payment records,
          longer only where law requires it). If you delete a memory item, it is removed immediately. If you ask us
          to delete your account, we delete your profile, task history and backup within 30 days, except records we
          are legally required to retain.</p>

        <h2>6. Your choices</h2>
        <ul>
          <li>Delete any single memory item, or turn memory off entirely, from Profile.</li>
          <li>Delete any document from your vault at any time.</li>
          <li>Ask us to export or delete your account data by emailing us (below) — we will confirm once it is
            done.</li>
          <li>Turn off location sharing at any time in your browser or device settings; Saathi still works without
            it, using the city on your profile instead.</li>
        </ul>

        <h2>7. Cookies and local storage</h2>
        <p>
          We use browser storage to keep you signed in and remember your preferences (language, Easy Mode). We do
          not use third-party advertising cookies. If we add analytics cookies in the future, we will update this
          page first.
        </p>

        <h2>8. Security</h2>
        <p>
          Data in transit is encrypted (HTTPS). Our database uses row-level security so a signed-in user can only
          read their own data by default, with the narrow, logged exception in section 4. We never store passwords —
          sign-in is passwordless by design, which removes an entire class of risk.
        </p>

        <h2>9. Children and family accounts</h2>
        <p>
          Digital Saathi accounts are for people 18 and older. An elderly parent or a minor family member can be
          added as a linked profile under an adult&rsquo;s account (see Family), with permissions the adult
          controls — we do not knowingly collect data directly from a child in an independent account.
        </p>

        <h2>10. Changes to this policy</h2>
        <p>We will update the date at the top when this page changes, and tell you in the app for material
          changes.</p>

        <h2>11. Contact</h2>
        <p>
          Questions about this policy, or a request to access, correct or delete your data:{' '}
          <a href="mailto:onlinedesk120@gmail.com">onlinedesk120@gmail.com</a>. See also our{' '}
          <Link href="/terms">Terms &amp; Conditions</Link>.
        </p>

        <p className="small muted mt2">
          This page describes how Digital Saathi currently operates and is provided as a general template, not as
          legal advice. Please have it reviewed by a qualified lawyer for your entity and jurisdiction before relying
          on it at scale.
        </p>
      </main>
      <Footer />
    </>
  );
}
