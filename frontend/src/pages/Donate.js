import { useState } from "react";
import { Link } from "react-router-dom";
import "./Donate.css";

const PRESET_AMOUNTS = [200, 500, 1000, 2500, 5000];

const IMPACT = [
  { amount: "₹200",  icon: "📚", desc: "Buys school stationery for one child for a month" },
  { amount: "₹500",  icon: "🍱", desc: "Provides nutritious mid-day meals for a week" },
  { amount: "₹1,000",icon: "💻", desc: "Funds one session of digital literacy training" },
  { amount: "₹5,000",icon: "🎓", desc: "Sponsors a child's full education for a month" },
];

const FAQS = [
  { q: "Is my donation tax-deductible?",        a: "Yes! NayePankh is 80G certified. Donations are eligible for 50% tax deduction under Section 80G of the Income Tax Act." },
  { q: "How is my donation used?",               a: "100% of your donation goes directly to programs — education materials, meals, digital training and community welfare." },
  { q: "Can I donate monthly?",                  a: "Yes, recurring monthly donations are our most impactful option. Set up a standing instruction with your bank for hassle-free giving." },
  { q: "Will I receive a donation receipt?",     a: "Absolutely. You'll receive an official 80G receipt via email within 48 hours of your donation." },
];

function Donate() {
  const [selected,   setSelected]   = useState(null);
  const [custom,     setCustom]     = useState("");
  const [faqOpen,    setFaqOpen]    = useState(null);

  const displayAmount = custom || (selected ? `₹${selected}` : null);

  const handleDonate = () => {
    // Opens the official NayePankh donation page (unchanged from original intent)
    window.open("https://nayepankh.com", "_blank", "noopener");
  };

  return (
    <div className="donate-page">

      {/* Hero */}
      <section className="page-hero page-hero--donate">
        <div className="container page-hero__inner">
          <span className="eyebrow">Make a Difference</span>
          <h1 className="display-xl page-hero__heading">
            Support Our <em className="page-hero__em">Cause 💖</em>
          </h1>
          <p className="page-hero__sub">
            Your kindness changes a child's story. Every contribution — big or small —
            fuels education, opportunity, and hope for communities in need.
          </p>
        </div>
      </section>

      {/* Donate widget + impact */}
      <section className="section donate-main">
        <div className="container donate-main__grid">

          {/* Donation widget */}
          <div className="donate-widget card">
            <div className="donate-widget__header">
              <h2 className="donate-widget__title">Choose Your Donation</h2>
              <p className="donate-widget__sub">
                All donations are 80G certified — get up to 50% tax benefit.
              </p>
            </div>

            <div className="donate-presets">
              {PRESET_AMOUNTS.map(amt => (
                <button
                  key={amt}
                  className={`preset-btn${selected === amt && !custom ? " preset-btn--active" : ""}`}
                  onClick={() => { setSelected(amt); setCustom(""); }}
                  aria-pressed={selected === amt && !custom}
                >
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="donate-custom form-group">
              <label className="form-label" htmlFor="custom-amount">Or enter a custom amount</label>
              <div className="donate-custom__input-wrap">
                <span className="donate-custom__prefix">₹</span>
                <input
                  id="custom-amount"
                  className="form-input donate-custom__input"
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={custom}
                  onChange={e => { setCustom(e.target.value); setSelected(null); }}
                />
              </div>
            </div>

            {displayAmount && (
              <div className="donate-selected-summary">
                Donating <strong>{displayAmount}</strong> — thank you! 🙏
              </div>
            )}

            <button
              className="btn btn-primary btn-lg btn-full donate-widget__cta"
              onClick={handleDonate}
            >
              Donate Now →
            </button>

            <div className="donate-widget__badges">
              <span className="donate-badge">🔒 Secure</span>
              <span className="donate-badge">✅ 80G Receipt</span>
              <span className="donate-badge">🏛️ Govt. Registered</span>
            </div>
          </div>

          {/* Impact breakdown */}
          <div className="donate-impact">
            <h2 className="display-md donate-impact__heading">Your Money at Work</h2>
            <p className="donate-impact__sub">
              Here's exactly what your donation enables — every rupee has a purpose.
            </p>
            <div className="impact-list">
              {IMPACT.map(item => (
                <div className="impact-item" key={item.amount}>
                  <div className="impact-item__icon">{item.icon}</div>
                  <div>
                    <div className="impact-item__amount">{item.amount}</div>
                    <div className="impact-item__desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="donate-trust">
        <div className="container donate-trust__inner">
          {[
            { icon: "🏛️", label: "UP Govt. Registered" },
            { icon: "💰", label: "80G Tax Benefit"      },
            { icon: "✅", label: "12A Certified"         },
            { icon: "📊", label: "100% Transparency"    },
            { icon: "🔒", label: "Secure Payments"       },
          ].map(t => (
            <div className="trust-item" key={t.label}>
              <span className="trust-item__icon">{t.icon}</span>
              <span className="trust-item__label">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section donate-faq">
        <div className="container donate-faq__inner">
          <div className="section-header">
            <span className="eyebrow">Questions</span>
            <h2 className="display-lg section-header__heading">Frequently Asked</h2>
          </div>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div
                className={`faq-item${faqOpen === i ? " faq-item--open" : ""}`}
                key={faq.q}
              >
                <button
                  className="faq-question"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  aria-expanded={faqOpen === i}
                >
                  <span>{faq.q}</span>
                  <span className="faq-chevron" aria-hidden="true">{faqOpen === i ? "−" : "+"}</span>
                </button>
                {faqOpen === i && (
                  <div className="faq-answer">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer CTA */}
      <section className="donate-vol-cta">
        <div className="container donate-vol-cta__inner">
          <div className="donate-vol-cta__text">
            <h2 className="display-md donate-vol-cta__heading">Can't donate? Volunteer instead.</h2>
            <p className="donate-vol-cta__sub">
              Your time and skills are just as valuable. Our AI matches you with the perfect role.
            </p>
          </div>
          <Link to="/volunteer" className="btn btn-secondary btn-lg">Become a Volunteer</Link>
        </div>
      </section>

    </div>
  );
}

export default Donate;
