import { t } from "../lib/ui-strings.js";

export default function Onboarding({ onDismiss, lang = "pt" }) {
  return (
    <div className="onboarding">
      <div className="ob-hero">
        Prepare-se para o<br/>
        <strong>ISTQB CTFL v4.0</strong>
      </div>

      <div className="ob-cards">
        <div className="ob-card">
          <span className="ob-icon">📚</span>
          <div className="ob-card-title">Estudo</div>
          <div className="ob-card-desc">Feedback e explicação a cada questão. Filtre por domínio ou revise o que errou.</div>
        </div>
        <div className="ob-card">
          <span className="ob-icon">⏱</span>
          <div className="ob-card-title">Simulado</div>
          <div className="ob-card-desc">{t(lang, "onboarding.examCardDesc")}</div>
        </div>
        <div className="ob-card">
          <span className="ob-icon">🃏</span>
          <div className="ob-card-title">Flashcards</div>
          <div className="ob-card-desc">Marque o que sabe e filtre os pendentes para revisão direcionada.</div>
        </div>
      </div>

      <div className="ob-stats">
        <span>{t(lang, "onboarding.statsQuestions")}</span>
        <span>·</span>
        <span>6 domínios</span>
        <span>·</span>
        <span>PT-BR</span>
        <span>·</span>
        <span>Gratuito</span>
      </div>

      <button className="btn primary ob-cta" onClick={onDismiss}>
        Começar →
      </button>

      <p className="ob-disclaimer">
        Material independente, não afiliado ao ISTQB.
      </p>
    </div>
  );
}
