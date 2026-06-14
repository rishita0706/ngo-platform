import { Link } from "react-router-dom";
import "./About.css";

const MILESTONES = [
  { year: "2020", title: "Founded", desc: "NayePankh Foundation was established with a vision to educate underprivileged children across Uttar Pradesh." },
  { year: "2021", title: "First 100 Students", desc: "Reached our first milestone — 100 children enrolled in our free education program across 3 districts." },
  { year: "2022", title: "Government Recognition", desc: "Received UP Government registration, 80G and 12A certifications, enabling tax-exempt donations." },
  { year: "2023", title: "Digital Programs Launch", desc: "Launched tech literacy programs, teaching coding and internet skills to youth in rural areas." },
  { year: "2024", title: "AI Volunteer Matching", desc: "Introduced our ML-powered volunteer role recommendation system — a first for NGOs in UP." },
  { year: "2025", title: "1000+ Lives Changed", desc: "Surpassed 1000 students helped and 500 active volunteers across 20+ communities." },
];

const TEAM = [
  { name: "Founder", role: "Visionary & Director", icon: "👤", desc: "Passionate about bridging the education gap with compassion and technology." },
  { name: "Education Lead", role: "Program Coordinator", icon: "📚", desc: "Designs curriculum and runs day-to-day education initiatives across communities." },
  { name: "Tech Head", role: "Digital & AI Lead", icon: "💻", desc: "Builds tech tools including our AI volunteer matching system and digital platforms." },
];

const VALUES = [
  { icon: "❤️",  title: "Compassion",    desc: "Every action is rooted in genuine care for the communities we serve." },
  { icon: "🔍",  title: "Transparency",  desc: "We believe donors and volunteers deserve full visibility into our impact." },
  { icon: "🤖",  title: "Innovation",    desc: "Technology is our force multiplier — we use AI to maximise every contribution." },
  { icon: "🤝",  title: "Community",     desc: "We grow alongside the communities we serve, not separate from them." },
];

function About() {
  return (
    <div className="about-page">

      {/* Page Hero */}
      <section className="page-hero page-hero--about">
        <div className="container page-hero__inner">
          <span className="eyebrow">Our Story</span>
          <h1 className="display-xl page-hero__heading">
            About <em className="page-hero__em">NayePankh</em> Foundation
          </h1>
          <p className="page-hero__sub">
            नए पंख — meaning "New Wings" — because every child deserves the wings to fly.
            We are a UP Government registered NGO empowering communities through education,
            technology and unwavering compassion.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section about-mission">
        <div className="container about-mission__grid">
          <div className="about-mission__card about-mission__card--mission">
            <div className="about-mission__icon">🎯</div>
            <h2 className="display-md about-mission__heading">Our Mission</h2>
            <p className="about-mission__text">
              To bridge the education gap by providing free, quality learning experiences
              to underprivileged children — combining compassionate human mentorship with
              the power of artificial intelligence.
            </p>
          </div>
          <div className="about-mission__card about-mission__card--vision">
            <div className="about-mission__icon">🌟</div>
            <h2 className="display-md about-mission__heading">Our Vision</h2>
            <p className="about-mission__text">
              A future where every child in Uttar Pradesh, regardless of their economic
              background, has access to world-class education and the digital skills needed
              to thrive in the 21st century.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section about-timeline">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Our Journey</span>
            <h2 className="display-lg section-header__heading">Milestones that define us</h2>
          </div>
          <div className="timeline">
            {MILESTONES.map((m, i) => (
              <div className={`timeline-item${i % 2 === 0 ? " timeline-item--left" : " timeline-item--right"}`} key={m.year}>
                <div className="timeline-content">
                  <div className="timeline-year">{m.year}</div>
                  <h3 className="timeline-title">{m.title}</h3>
                  <p className="timeline-desc">{m.desc}</p>
                </div>
                <div className="timeline-dot" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section about-values">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">What Drives Us</span>
            <h2 className="display-lg section-header__heading">Our core values</h2>
          </div>
          <div className="values-grid">
            {VALUES.map(v => (
              <div className="value-card card" key={v.title}>
                <div className="value-card__icon">{v.icon}</div>
                <h3 className="value-card__title">{v.title}</h3>
                <p className="value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="about-certs">
        <div className="container about-certs__inner">
          <h2 className="display-md about-certs__heading">Government Recognised &amp; Certified</h2>
          <div className="certs-grid">
            {[
              { label: "UP Government Registered", sub: "Officially registered under Uttar Pradesh government", icon: "🏛️" },
              { label: "80G Tax Exemption",         sub: "Donations are eligible for 50% income tax deduction", icon: "💰" },
              { label: "12A Certification",         sub: "NGO income is exempt from tax — ensuring maximum utilisation", icon: "✅" },
            ].map(c => (
              <div className="cert-card" key={c.label}>
                <div className="cert-card__icon">{c.icon}</div>
                <div className="cert-card__label">{c.label}</div>
                <div className="cert-card__sub">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section about-cta">
        <div className="container about-cta__inner">
          <h2 className="display-md about-cta__heading">Join our growing family of changemakers</h2>
          <p className="about-cta__sub">Volunteer your skills or support us financially — every contribution matters.</p>
          <div className="about-cta__actions">
            <Link to="/volunteer" className="btn btn-primary btn-lg">Volunteer Now</Link>
            <Link to="/donate"    className="btn btn-navy    btn-lg">Donate Today</Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default About;
