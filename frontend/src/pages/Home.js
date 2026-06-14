import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./Home.css";

/* ── Animated counter hook ──────────────────────────── */
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

/* ── Intersection observer hook ─────────────────────── */
function useInView(threshold = 0.2) {
  const ref  = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── Stat card ──────────────────────────────────────── */
function StatCard({ value, suffix = "+", label, icon, delay = 0, start }) {
  const count = useCountUp(value, 1600, start);
  return (
    <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__number">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

/* ── Program card ───────────────────────────────────── */
function ProgramCard({ icon, title, description, delay = 0 }) {
  return (
    <div className="program-card card" style={{ animationDelay: `${delay}ms` }}>
      <div className="program-card__icon">{icon}</div>
      <h3 className="program-card__title">{title}</h3>
      <p className="program-card__desc">{description}</p>
    </div>
  );
}

/* ── Testimonial card ───────────────────────────────── */
function TestimonialCard({ quote, name, role, delay = 0 }) {
  return (
    <div className="testimonial-card card" style={{ animationDelay: `${delay}ms` }}>
      <p className="testimonial-card__quote">"{quote}"</p>
      <div className="testimonial-card__author">
        <div className="testimonial-card__avatar">{name[0]}</div>
        <div>
          <div className="testimonial-card__name">{name}</div>
          <div className="testimonial-card__role">{role}</div>
        </div>
      </div>
    </div>
  );
}

/* ── HOME PAGE ──────────────────────────────────────── */
function Home() {
  const [statsRef, statsInView] = useInView(0.3);

  return (
    <div className="home">

      {/* HERO */}
      <section className="hero" aria-label="Hero">
        <div className="hero__bg" aria-hidden="true">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
        </div>
        <div className="hero__content container">
          <div className="hero__text">
            <span className="eyebrow anim-fade-up">UP Government · 80G · 12A Registered NGO</span>
            <h1 className="display-xl hero__headline anim-fade-up-2">
              It's that easy to<br />
              <em className="hero__headline-em">bring a Smile</em><br />
              on Their Faces
            </h1>
            <p className="hero__sub anim-fade-up-3">
              We don't ask for much — just help us with what you can.
              Be it Money, Skill, or Your Time. Together we change lives.
            </p>
            <div className="hero__actions anim-fade-up-3">
              <Link to="/donate" className="btn btn-primary btn-lg">
                Donate Now 💛
              </Link>
              <Link to="/volunteer" className="btn btn-secondary btn-lg">
                Become a Volunteer
              </Link>
            </div>
          </div>
          <div className="hero__visual anim-fade-in" aria-hidden="true">
            <div className="hero__card-stack">
              <div className="hero__impact-card hero__impact-card--1">
                <span className="hero__impact-icon">📚</span>
                <span className="hero__impact-text">1000+ Students Educated</span>
              </div>
              <div className="hero__impact-card hero__impact-card--2">
                <span className="hero__impact-icon">🤝</span>
                <span className="hero__impact-text">500+ Active Volunteers</span>
              </div>
              <div className="hero__impact-card hero__impact-card--3">
                <span className="hero__impact-icon">🏙️</span>
                <span className="hero__impact-text">20+ Communities Served</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero__wave" aria-hidden="true">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#F8F7F4" />
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section" ref={statsRef} aria-label="Our impact">
        <div className="container stats-section__inner">
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 100} start={statsInView} />
            ))}
          </div>
        </div>
      </section>

      {/* MISSION STRIP */}
      <section className="mission-strip" aria-label="Our mission">
        <div className="container mission-strip__inner">
          <div className="mission-strip__text">
            <span className="eyebrow">Our Purpose</span>
            <h2 className="display-lg mission-strip__heading">
              Empowering communities through education &amp; technology
            </h2>
            <p className="mission-strip__desc">
              NayePankh Foundation bridges the gap between potential and opportunity.
              We work with underprivileged children, providing them access to quality
              education, digital skills, and compassionate mentorship — powered by AI.
            </p>
            <Link to="/about" className="btn btn-outline">
              Learn Our Story →
            </Link>
          </div>
          <div className="mission-strip__cards" aria-hidden="true">
            <div className="mission-badge">
              <span className="mission-badge__icon">🏛️</span>
              <span className="mission-badge__text">Govt. Registered</span>
            </div>
            <div className="mission-badge">
              <span className="mission-badge__icon">💯</span>
              <span className="mission-badge__text">Tax Exemption 80G</span>
            </div>
            <div className="mission-badge">
              <span className="mission-badge__icon">✅</span>
              <span className="mission-badge__text">12A Certified</span>
            </div>
            <div className="mission-badge mission-badge--highlight">
              <span className="mission-badge__icon">🤖</span>
              <span className="mission-badge__text">AI-Powered Matching</span>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="section programs-section" aria-label="Our programs">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">What We Do</span>
            <h2 className="display-lg section-header__heading">Programs that create lasting change</h2>
            <p className="section-header__sub">
              From classroom education to digital empowerment — our programs touch every dimension of community growth.
            </p>
          </div>
          <div className="programs-grid">
            {PROGRAMS.map((p, i) => (
              <ProgramCard key={p.title} {...p} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO HELP */}
      <section className="help-section section" aria-label="How to help">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Get Involved</span>
            <h2 className="display-lg section-header__heading">Three ways to make a difference</h2>
          </div>
          <div className="help-grid">
            {HELP_WAYS.map((w, i) => (
              <div className="help-card" key={w.title}>
                <div className="help-card__step">{String(i + 1).padStart(2, "0")}</div>
                <div className="help-card__icon">{w.icon}</div>
                <h3 className="help-card__title">{w.title}</h3>
                <p className="help-card__desc">{w.description}</p>
                <Link to={w.to} className="btn btn-ghost help-card__cta">
                  {w.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section testimonials-section" aria-label="Testimonials">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Voices</span>
            <h2 className="display-lg section-header__heading">What our volunteers say</h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={t.name} {...t} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner" aria-label="Call to action">
        <div className="container cta-banner__inner">
          <div className="cta-banner__text">
            <h2 className="display-md cta-banner__heading">
              Ready to change a child's life today?
            </h2>
            <p className="cta-banner__sub">
              Every rupee, every hour, every skill you share — creates ripples of change.
            </p>
          </div>
          <div className="cta-banner__actions">
            <Link to="/donate" className="btn btn-primary btn-lg">
              Donate Now
            </Link>
            <Link to="/volunteer" className="btn btn-secondary btn-lg">
              Volunteer With Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Data ──────────────────────────────────────────── */
const STATS = [
  { value: 1000, suffix: "+", label: "Students Helped",   icon: "📚" },
  { value: 500,  suffix: "+", label: "Active Volunteers", icon: "🤝" },
  { value: 20,   suffix: "+", label: "Communities",       icon: "🏙️" },
  { value: 5,    suffix: "",  label: "Years of Impact",   icon: "🌟" },
];

const PROGRAMS = [
  { icon: "📖", title: "Education for All",     description: "Free quality education for underprivileged children across UP — covering academics, life skills, and digital literacy." },
  { icon: "💻", title: "Digital Empowerment",   description: "Teaching coding, internet skills, and technology fundamentals to youth who otherwise lack access to digital tools." },
  { icon: "🤖", title: "AI Volunteer Matching", description: "Our machine-learning model intelligently matches volunteers to roles based on their unique skills and interests." },
  { icon: "🌱", title: "Community Welfare",      description: "Holistic programs addressing nutrition, sanitation, and mental wellbeing in underserved communities." },
  { icon: "📰", title: "Awareness Campaigns",   description: "Spreading education awareness through newspaper features, events, and social media outreach." },
  { icon: "🎓", title: "Mentorship Program",     description: "Pairing students with experienced mentors who guide them toward brighter educational and career futures." },
];

const HELP_WAYS = [
  { icon: "💛", title: "Donate",           description: "Your financial contribution directly funds education materials, meals, and learning programs for children in need.", cta: "Donate Now", to: "/donate" },
  { icon: "🙌", title: "Volunteer",        description: "Contribute your time and talents. Our AI system finds the perfect role matching your skills and interests.", cta: "Join as Volunteer", to: "/volunteer" },
  { icon: "📣", title: "Spread the Word",  description: "Share our mission with friends and family. Awareness is free and every new supporter multiplies our impact.", cta: "Learn More", to: "/about" },
];

const TESTIMONIALS = [
  { quote: "Volunteering with NayePankh has been the most meaningful experience of my life. The AI matching put me exactly where I could help most.", name: "Priya Sharma",    role: "Education Volunteer, Lucknow" },
  { quote: "I'm amazed at how technology and compassion come together here. My donation went exactly where it was needed — I can see the impact.", name: "Rahul Verma",      role: "Monthly Donor" },
  { quote: "NayePankh gave me a platform to use my coding skills for social good. I teach web development to kids who are now building their own apps!", name: "Ankit Gupta",     role: "Tech Volunteer, Kanpur" },
];

export default Home;