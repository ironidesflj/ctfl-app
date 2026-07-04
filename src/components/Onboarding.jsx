import { useState } from "react";
import { t } from "../lib/ui-strings.js";

export default function Onboarding({ onDismiss, lang = "pt" }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [demoAnswer, setDemoAnswer] = useState(null);

  const features = [
    { icon: "📚", title: t(lang, "onboarding.featureStudyTitle"), desc: t(lang, "onboarding.featureStudyDesc") },
    { icon: "⏱", title: t(lang, "onboarding.featureExamTitle"), desc: t(lang, "onboarding.examCardDesc") },
    { icon: "🔁", title: t(lang, "onboarding.featureSRSTitle"), desc: t(lang, "onboarding.featureSRSDesc") },
    { icon: "📖", title: t(lang, "onboarding.featureGlossaryTitle"), desc: t(lang, "onboarding.featureGlossaryDesc") },
    { icon: "📊", title: t(lang, "onboarding.featureProgressTitle"), desc: t(lang, "onboarding.featureProgressDesc") },
    { icon: "🌐", title: t(lang, "onboarding.featureBilingualTitle"), desc: t(lang, "onboarding.featureBilingualDesc") },
  ];

  const faqItems = [1, 2, 3, 4, 5].map((n) => ({
    q: t(lang, `onboarding.faqQ${n}`),
    a: t(lang, `onboarding.faqA${n}`),
  }));

  const demoOptions = [
    { letter: "A", text: t(lang, "onboarding.mockupOptA"), correct: false },
    { letter: "B", text: t(lang, "onboarding.mockupOptB"), correct: true },
    { letter: "C", text: t(lang, "onboarding.mockupOptC"), correct: false },
  ];

  function handleDemoClick(i) {
    if (demoAnswer !== null) return;
    setDemoAnswer(i);
  }

  return (
    <div className="onboarding">
      {/* 1. Hero */}
      <span className="ob-badge">{t(lang, "onboarding.badge")}</span>

      <span className="ob-name-tag">Synapse</span>
      <div className="ob-hero">
        {t(lang, "onboarding.heroValueProp")}
      </div>
      <p className="ob-subtitle">{t(lang, "onboarding.heroSubtitle")}</p>

      <div className="ob-stats">
        <span>{t(lang, "onboarding.statsQuestions")}</span>
        <span>·</span>
        <span>{t(lang, "onboarding.statCerts")}</span>
        <span>·</span>
        <span>{t(lang, "onboarding.statLang")}</span>
        <span>·</span>
        <span>{t(lang, "onboarding.statFree")}</span>
      </div>

      <button className="btn primary ob-cta" onClick={onDismiss}>
        {t(lang, "onboarding.ctaStart")}
      </button>

      {/* 2. Features detalhadas */}
      <div className="ob-section">
        <h2 className="ob-section-title">{t(lang, "onboarding.featuresTitle")}</h2>
        <div className="ob-features">
          {features.map((f, i) => (
            <div className="ob-card" key={i}>
              <span className="ob-icon">{f.icon}</span>
              <div className="ob-card-title">{f.title}</div>
              <div className="ob-card-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Mini-demo interativo / como funciona */}
      <div className="ob-section">
        <h2 className="ob-section-title">{t(lang, "onboarding.mockupTitle")}</h2>
        <p className="muted" style={{textAlign: "center", marginBottom: "0.5rem"}}>
          {t(lang, "onboarding.mockupHint")}
        </p>
        <div className="ob-mockup-wrap">
          <div className="card">
            <div className="q-meta">
              <span className="q-domain">{t(lang, "onboarding.mockupDomain")}</span>
              <span className="klvl k1">K1</span>
            </div>
            <p className="q-text">{t(lang, "onboarding.mockupQuestion")}</p>
            <div className="options">
              {demoOptions.map((opt, i) => {
                let cls = "opt";
                if (demoAnswer !== null) {
                  cls += " locked";
                  if (opt.correct) cls += demoAnswer === i ? " correct" : " reveal";
                  else if (demoAnswer === i) cls += " wrong";
                }
                return (
                  <button key={i} className={cls} onClick={() => handleDemoClick(i)} disabled={demoAnswer !== null}>
                    <span className="opt-letter">{opt.letter}</span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>
            {demoAnswer !== null && (
              <div className="explanation">{t(lang, "onboarding.mockupExp")}</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Prova social */}
      <div className="ob-social">
        <span>{t(lang, "onboarding.socialFreeText")}</span>
        <a
          className="ob-social-link"
          href="https://github.com/ironidesflj/ctfl-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t(lang, "onboarding.socialOpenSourceText")} ↗
        </a>
        <span className="ob-future-note">{t(lang, "onboarding.socialFutureNote")}</span>
      </div>

      {/* 5. FAQ */}
      <div className="ob-section">
        <h2 className="ob-section-title">{t(lang, "onboarding.faqTitle")}</h2>
        <div className="ob-faq">
          {faqItems.map((item, i) => (
            <div className="ob-faq-item" key={i}>
              <button className="ob-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{item.q}</span>
                <span aria-hidden="true">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && <div className="ob-faq-a">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* 6. Sobre o autor */}
      <div className="ob-author">
        <h2 className="ob-section-title">{t(lang, "onboarding.authorTitle")}</h2>
        <p className="ob-author-bio">{t(lang, "onboarding.authorBio")}</p>
        <div className="ob-author-links">
          <a
            className="ob-author-link"
            href="https://linkedin.com/in/ironjunior"
            target="_blank"
            rel="noopener noreferrer"
          >
            in LinkedIn
          </a>
          <a
            className="ob-author-link"
            href="https://github.com/ironidesflj"
            target="_blank"
            rel="noopener noreferrer"
          >
            {"</>"} GitHub
          </a>
        </div>
      </div>

      {/* 7. CTA final */}
      <button className="btn primary ob-cta" onClick={onDismiss}>
        {t(lang, "onboarding.ctaStartFinal")}
      </button>

      <p className="ob-disclaimer">
        {t(lang, "footer")}
      </p>
    </div>
  );
}
