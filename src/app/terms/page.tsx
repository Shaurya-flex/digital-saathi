import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'How Digital Saathi works: credits vs money, approval before any payment, Razorpay payments, how the service grows city by city, refunds and disputes, and the grievance officer contact.',
  alternates: { canonical: '/terms' },
};

export default function Terms() {
  return (
    <>
      <main id="main" className="narrow" style={{ padding: '2.4rem 0 4rem' }}>
        <h1>Terms &amp; Conditions</h1>
        <p className="small muted">Last updated: 10 September 2026</p>

        <p>
          These Terms govern your use of Digital Saathi (the &ldquo;Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
          By creating an account or using the Service you agree to them. If you do not agree, please do not use the
          Service.
        </p>

        <h2>1. What Digital Saathi is</h2>
        <p>
          Digital Saathi is an AI concierge that carries out digital tasks (recharge, bill payment, document help,
          research, drafting, reminders) directly, and connects you with independently verified local service
          partners and digital agents for anything a computer should not decide or complete on its own — a home
          repair, an IRCTC booking that needs a login and a captcha, a government form that needs judgement. We are
          the platform that makes the request, shows the price, and routes the work; we are not the electrician,
          the travel agent or the government department doing it.
        </p>

        <h2>2. Eligibility and your account</h2>
        <ul>
          <li>You must be 18 or older to hold an account. A parent or guardian may add an elderly or minor family
            member as a linked profile under their own account, as described in Family.</li>
          <li>You sign in with Google or with an email link — we never ask you to create or store a password.</li>
          <li>You are responsible for actions taken from your account, including approvals given while signed in.
            Tell us immediately if you believe your account has been accessed without your permission.</li>
          <li>Information you give us (name, phone, address, preferences) must be accurate. We may suspend an
            account that we reasonably believe is fraudulent, abusive, or used to harm partners, agents or other
            users.</li>
        </ul>

        <h2>3. Credits, plans and money</h2>
        <ul>
          <li><strong>Credits</strong> are a usage unit for Saathi&rsquo;s own work (research, drafting, form help,
            escalation to a digital agent). They are not currency, cannot be withdrawn, sold or transferred to
            another person, and unused credits do not carry over when a plan renews.</li>
          <li><strong>Money in your wallet</strong> pays for real-world costs — bills, recharges, and service
            partners — and is kept separate from credits at all times. One is never converted into the other.</li>
          <li>Subscription plans renew monthly at the price shown at checkout; you can switch or cancel a plan from
            Wallet &amp; Credits at any time. Cancelling stops the next renewal; it does not refund the current
            cycle.</li>
        </ul>

        <h2>4. Approval, before anything happens</h2>
        <p>
          Nothing that costs money, books an appointment, submits a form, or touches an uploaded document happens
          without your explicit confirmation on screen (or, if you set it, an auto-approve rule for small, low-risk
          amounts you choose yourself). Every consequential action is written to an audit trail you can read on the
          task itself. If Saathi is not confident it understood you correctly, it will say so and offer a human
          instead of guessing.
        </p>

        <h2>5. Payments</h2>
        <p>
          Payments are processed by Razorpay, a licensed Indian payment aggregator, using UPI, cards, netbanking or
          wallets. Digital Saathi never sees or stores your full card number; Razorpay handles that under its own
          PCI-DSS compliance. If a payment is deducted but a purchase or booking is not confirmed, it is
          automatically refunded by the gateway in the usual banking timeframe; if it is not, contact us with your
          payment ID and we will follow up with Razorpay on your behalf.
        </p>

        <h2>6. How the service grows — not everything is live everywhere on day one</h2>
        <p>
          Digital Saathi is scaling deliberately rather than promising a category before it can be delivered
          safely:
        </p>
        <ul>
          <li><strong>Digital tasks first.</strong> The AI-only categories (document help, drafting, research,
            reminders, recharge and bill lookups) are available from day one everywhere, because Saathi can do them
            itself without a human in the loop.</li>
          <li><strong>Local services, city by city.</strong> A home-visit category (electrician, plumber, salon,
            cleaning, and similar) goes live in a city only once we have verified service partners there — identity
            checked, and police-verified for anything that involves entering your home. If you ask for a service
            that has no verified partner near you yet, we will tell you plainly rather than send someone
            unverified, and we will notify you the moment one is available.</li>
          <li><strong>Human-escalation tasks, agent by agent.</strong> Tasks that need a person (train booking,
            certain government forms, appointment calls) are handled by digital agents as they onboard and pass
            verification; queue times shorten as the agent network grows.</li>
          <li>We will keep adding categories and cities as supply — verified partners and agents — grows to match
            demand. Nothing here obliges us to launch a specific category or city by a specific date.</li>
        </ul>

        <h2>7. Service partners and digital agents</h2>
        <p>
          Service partners and digital agents are independent professionals who apply, are verified, and choose
          which jobs to accept — they are not Digital Saathi employees or agents in the legal sense, and we are not
          a party to the service they perform for you beyond facilitating the booking, the price shown, and dispute
          resolution. We verify identity (Aadhaar/PAN) and, for home-visit categories, police verification, before a
          partner can accept their first job, and we act on reports of poor conduct — but we cannot guarantee the
          outcome of every job any more than any marketplace can. The commission we take on a job is always shown
          to the partner or agent before they accept it.
        </p>

        <h2>8. Government-related guidance</h2>
        <p>
          We are not affiliated with any government department. For tasks like PAN, passport, EPFO or scheme
          discovery, Saathi explains the process, prepares checklists, and helps fill forms — you review and submit
          everything yourself. We never present an unofficial route as an official one.
        </p>

        <h2>9. Acceptable use</h2>
        <p>You agree not to: provide false identity or payment information; use the Service for anything unlawful;
          abuse, threaten or defraud a service partner, agent or another user; attempt to bypass the approval or
          verification steps described above; or scrape, reverse-engineer or resell access to the Service.</p>

        <h2>10. Disputes and refunds</h2>
        <p>
          If a task or job goes wrong, use Report a problem on the task, or contact us directly (see Contact
          below). We review disputes and can issue a full or partial refund to your wallet where a service partner,
          agent or the platform itself failed to deliver as agreed. Refund decisions are made in good faith based on
          the audit trail of the task.
        </p>

        <h2>11. Intellectual property</h2>
        <p>The Digital Saathi name, design and software are our property or licensed to us. You keep ownership of
          any document or content you upload; you grant us a limited licence to process it solely to carry out the
          task you asked for, per our <Link href="/privacy">Privacy Policy</Link>.</p>

        <h2>12. Disclaimers and liability</h2>
        <p>
          The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis while it continues
          to develop. We do our best to route every task safely and correctly, but we do not guarantee the Service
          will be uninterrupted, error-free, or that every third-party integration (recharge, bills, travel,
          government portals) will always respond correctly. To the maximum extent permitted by law, our liability
          for any claim relating to the Service is limited to the amount of platform fees or subscription fees you
          paid us in the three months before the claim arose. Nothing in these Terms limits liability that cannot
          lawfully be limited, including for fraud.
        </p>

        <h2>13. Changes to these Terms</h2>
        <p>We may update these Terms as the Service grows; we will change the date at the top and, for material
          changes, tell you in the app. Continuing to use the Service after a change means you accept the updated
          Terms.</p>

        <h2>14. Governing law and grievance officer</h2>
        <p>
          These Terms are governed by the laws of India. In accordance with the Information Technology (Intermediary
          Guidelines and Digital Media Ethics Code) Rules, 2021, our Grievance Officer can be reached at{' '}
          <a href="mailto:onlinedesk120@gmail.com">onlinedesk120@gmail.com</a>. We aim to acknowledge grievances
          within 24 hours and resolve them within 15 days.
        </p>

        <h2>15. Contact</h2>
        <p>Questions about these Terms: <a href="mailto:onlinedesk120@gmail.com">onlinedesk120@gmail.com</a>.</p>

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
