import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Volunteer.css";

const ROLES = [
  { icon: "📖", label: "Mentor / Teacher",    value: "teaching"  },
  { icon: "💻", label: "Tech & Web Support",  value: "tech"      },
  { icon: "🤝", label: "Community Outreach",  value: "social"    },
  { icon: "📸", label: "Media & Content",     value: "media"     },
  { icon: "🎨", label: "Creative Design",     value: "design"    },
  { icon: "📋", label: "Event Management",    value: "events"    },
];

const BENEFITS = [
  { icon: "🏅", title: "Volunteer Certificate",   desc: "Receive an official NayePankh volunteer certificate." },
  { icon: "🤖", title: "AI Role Matching",        desc: "Our AI finds your best-fit role based on your skills." },
  { icon: "🌟", title: "Real Impact",             desc: "Directly see the difference you make in children's lives." },
  { icon: "🤝", title: "Community Network",       desc: "Join 500+ passionate changemakers across UP." },
];

function Volunteer() {
  const [form, setForm]       = useState({ name: "", email: "", skills: "", interest: "" });
  const [status, setStatus]   = useState(null); // null | "loading" | "success" | "error"
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };
  const setRoleHint = (val) => {
    setForm(prev => ({ ...prev, skills: val }));
  };

  const isValid = form.name.trim() && form.email.trim() && form.skills.trim() && form.interest.trim();

  const handleSubmit = async () => {
    if (!isValid || status === "loading") return;
    setStatus("loading");
    try {
      await axios.post("http://localhost:5000/volunteer", form);
      setStatus("success");
      setForm({ name: "", email: "", skills: "", interest: "" });
      setTouched({});
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="volunteer-page">

      {/* Page Hero */}
      <section className="page-hero page-hero--volunteer">
        <div className="container page-hero__inner">
          <span className="eyebrow">Join Our Team</span>
          <h1 className="display-xl page-hero__heading">
            Volunteer with <em className="page-hero__em">NayePankh</em>
          </h1>
          <p className="page-hero__sub">
            Share your skills, time, and heart. Our AI-powered matching system
            finds the perfect role for you — making your impact as meaningful as possible.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="section volunteer-benefits">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Why Volunteer</span>
            <h2 className="display-lg section-header__heading">What you gain while giving</h2>
          </div>
          <div className="benefits-grid">
            {BENEFITS.map(b => (
              <div className="benefit-card card" key={b.title}>
                <div className="benefit-card__icon">{b.icon}</div>
                <h3 className="benefit-card__title">{b.title}</h3>
                <p className="benefit-card__desc">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role hints */}
      <section className="volunteer-roles">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Opportunities</span>
            <h2 className="display-lg section-header__heading">Find your role</h2>
            <p className="section-header__sub">Click any role below to pre-fill your skill area in the registration form.</p>
          </div>
          <div className="roles-grid">
            {ROLES.map(r => (
              <button
                key={r.value}
                className={`role-chip${form.skills === r.value ? " role-chip--active" : ""}`}
                onClick={() => setRoleHint(r.value)}
                aria-pressed={form.skills === r.value}
              >
                <span className="role-chip__icon">{r.icon}</span>
                <span className="role-chip__label">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Registration form */}
      <section className="section volunteer-form-section">
        <div className="container volunteer-form-container">
          <div className="volunteer-form-header">
            <span className="eyebrow">Register</span>
            <h2 className="display-md volunteer-form-header__heading">Join as a Volunteer</h2>
            <p className="volunteer-form-header__sub">
              Fill in your details and we'll reach out with your personalised role recommendation.
            </p>
          </div>

          {status === "success" ? (
            <div className="volunteer-success">
              <div className="volunteer-success__icon">🎉</div>
              <h3 className="volunteer-success__heading">You're registered!</h3>
              <p className="volunteer-success__sub">
                Welcome to the NayePankh family. We'll be in touch soon with your role details.
              </p>
              <button
                className="btn btn-outline"
                onClick={() => setStatus(null)}
              >
                Register Another Volunteer
              </button>
            </div>
          ) : (
            <div className="volunteer-form card">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="vol-name">Full Name *</label>
                  <input
                    id="vol-name"
                    className={`form-input${touched.name && !form.name.trim() ? " form-input--error" : ""}`}
                    name="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="name"
                  />
                  {touched.name && !form.name.trim() && (
                    <span className="form-error">Name is required</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="vol-email">Email Address *</label>
                  <input
                    id="vol-email"
                    className={`form-input${touched.email && !form.email.trim() ? " form-input--error" : ""}`}
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="email"
                  />
                  {touched.email && !form.email.trim() && (
                    <span className="form-error">Email is required</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="vol-skills">Your Skills *</label>
                  <input
                    id="vol-skills"
                    className={`form-input${touched.skills && !form.skills.trim() ? " form-input--error" : ""}`}
                    name="skills"
                    placeholder="e.g. teaching, coding, social work"
                    value={form.skills}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.skills && !form.skills.trim() && (
                    <span className="form-error">Skills are required</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="vol-interest">Area of Interest *</label>
                  <input
                    id="vol-interest"
                    className={`form-input${touched.interest && !form.interest.trim() ? " form-input--error" : ""}`}
                    name="interest"
                    placeholder="e.g. education, web, community"
                    value={form.interest}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.interest && !form.interest.trim() && (
                    <span className="form-error">Interest area is required</span>
                  )}
                </div>
              </div>

              {status === "error" && (
                <div className="form-alert form-alert--error">
                  ⚠️ Something went wrong. Please try again or contact us directly.
                </div>
              )}

              <button
                className="btn btn-primary btn-lg volunteer-form__submit"
                onClick={handleSubmit}
                disabled={!isValid || status === "loading"}
                aria-label="Submit volunteer registration"
              >
                {status === "loading" ? "Submitting…" : "Register as Volunteer 🚀"}
              </button>

              <p className="volunteer-form__tip">
                💡 Use the <Link to="/" className="volunteer-form__tip-link">AI chatbot</Link> for instant role recommendations.
              </p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

export default Volunteer;
