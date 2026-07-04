import { useNavigate } from "react-router-dom";
import { CERT_CATALOG } from "../certs-catalog.js";
import { DEFAULT_SECTION } from "../certs.js";
import BrandMark from "./BrandMark.jsx";

// Tela de seleção de certificação (/select) e destino do badge do masthead.
// Live → navega pra /{id}/{seção}; coming-soon → desabilitado; legacy →
// nota separada, fora da lista principal (decisão P4).
export default function CertSelector({ lang = "pt" }) {
  const navigate = useNavigate();

  const listed = CERT_CATALOG.filter((c) => c.status !== "legacy");
  const legacy = CERT_CATALOG.filter((c) => c.status === "legacy");

  const tx = {
    pt: { title: "Escolha sua certificação", sub: "Selecione qual exame ISTQB você está estudando.", soon: "em breve", legacy: "Conteúdo legado (sunset ISTQB) — mantido, sem destaque:" },
    en: { title: "Choose your certification", sub: "Pick which ISTQB exam you're studying.", soon: "coming soon", legacy: "Legacy content (ISTQB sunset) — kept, not featured:" },
  }[lang] || {};

  return (
    <div className="cert-select">
      <h2>{tx.title}</h2>
      <p className="cert-select-sub">{tx.sub}</p>

      <div className="cert-list">
        {listed.map((c) => {
          const isLive = c.status === "live";
          return (
            <button
              key={c.id}
              className="cert-card"
              data-cert={c.id}
              disabled={!isLive}
              aria-disabled={!isLive}
              onClick={isLive ? () => navigate(`/${c.id}/${DEFAULT_SECTION}`) : undefined}
            >
              <span className="cc-mark" aria-hidden="true"><BrandMark size={22} /></span>
              <span className="cc-body">
                <span className="cc-title">{c.label}</span>
                <span className="cc-sub">ISTQB {c.fullName} {c.version}</span>
              </span>
              {!isLive && <span className="cc-soon">{tx.soon}</span>}
            </button>
          );
        })}
      </div>

      {legacy.length > 0 && (
        <p className="cert-legacy-note">
          {tx.legacy} {legacy.map((c) => `${c.label} (${c.fullName})`).join(", ")}
        </p>
      )}
    </div>
  );
}
