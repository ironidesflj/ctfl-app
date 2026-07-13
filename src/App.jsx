import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, Link, useParams, useNavigate, useLocation } from "react-router-dom";
import Quiz from "./components/Quiz.jsx";
import Flashcards from "./components/Flashcards.jsx";
import Syllabus from "./components/Syllabus.jsx";
import Glossary from "./components/Glossary.jsx";
import Stats from "./components/Stats.jsx";
import Onboarding from "./components/Onboarding.jsx";
import CertSelector from "./components/CertSelector.jsx";
import BrandMark from "./components/BrandMark.jsx";
import { loadProgress, saveProgress, recordAnswer, getDueItems, setActiveCertForStorage } from "./lib/storage.js";
import { getBank } from "./lib/bank.js";
import { t } from "./lib/ui-strings.js";
import { isNotificationSupported, showLocalNotification, daysSinceLastStudy } from "./lib/notifications.js";
import { VALID_CERTS, DEFAULT_SECTION, LAST_CERT_KEY } from "./certs.js";
import { CATALOG_BY_ID } from "./certs-catalog.js";

/* ─── Route guard: validates :cert param ─── */
function CertGuard({ children }) {
  const { cert } = useParams();
  useEffect(() => {
    if (VALID_CERTS.includes(cert)) {
      localStorage.setItem(LAST_CERT_KEY, cert);
    }
  }, [cert]);
  if (!VALID_CERTS.includes(cert)) return <Navigate to="/" replace />;
  return children;
}

/* ─── Root: volta pro último cert salvo, ou cai na tela de seleção ─── */
function RootRedirect({ lang }) {
  let last;
  try { last = localStorage.getItem(LAST_CERT_KEY); } catch { /* ignore */ }
  if (last && VALID_CERTS.includes(last)) {
    return <Navigate to={`/${last}/${DEFAULT_SECTION}`} replace />;
  }
  // sem cert salvo (1ª visita / storage limpo): tela dedicada, não fallback fixo
  return <CertSelector lang={lang} />;
}

/* ─── Tab navigation (reads cert from URL) ─── */
function TabNav({ lang }) {
  const { cert } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const TABS = [
    { id: "quiz", label: t(lang, "tabs.quiz") },
    { id: "syllabus", label: t(lang, "tabs.syllabus") },
    { id: "flash", label: t(lang, "tabs.flashcards") },
    { id: "glossary", label: t(lang, "tabs.glossary") },
    { id: "stats", label: t(lang, "tabs.progress") }
  ];

  return (
    <nav className="tabs" role="tablist">
      {TABS.map((tb) => (
        <button
          key={tb.id}
          role="tab"
          aria-selected={location.pathname === `/${cert}/${tb.id}`}
          className={"tab" + (location.pathname === `/${cert}/${tb.id}` ? " active" : "")}
          onClick={() => navigate(`/${cert}/${tb.id}`)}
        >
          {tb.label}
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const location = useLocation();
  // Segmento cru da rota. `activeCert` = null fora de uma rota de cert válida
  // (ex: "/", "/select") → masthead neutro + sem data-cert (cai no fallback
  // --accent). `certId` mantém fallback "ctfl" só pra getBank() não quebrar
  // na "/" — os dois usos são distintos, um tolera fallback, o outro não.
  const certSeg = (location.pathname.split("/")[1] || "").toLowerCase();
  const activeCert = VALID_CERTS.includes(certSeg) ? certSeg : null;
  const certId = activeCert || "ctfl";

  const bank = useMemo(() => {
    try { return getBank(certId); }
    catch { return getBank("ctfl"); }
  }, [certId]);
  const { ALL } = bank;
  const catalogCert = activeCert ? CATALOG_BY_ID[activeCert] : null;
  // Progresso é por cert (namespaced em storage.js por certId). Recarrega
  // sempre que activeCert muda; em rotas neutras (/, /select) não há cert
  // ativo pra persistir, então mantém o último progresso carregado só em
  // memória (o effect de save abaixo pula quando !activeCert).
  const [progress, setProgress] = useState(() => {
    setActiveCertForStorage(certId);
    return loadProgress(certId);
  });

  useEffect(() => {
    if (!activeCert) return;
    setActiveCertForStorage(activeCert);
    setProgress(loadProgress(activeCert));
  }, [activeCert]);
  const [quizFilter, setQuizFilter] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem("ctfl_onboarding_done"); }
    catch { return false; }
  });
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("ctfl_lang") || "pt"; }
    catch { return "pt"; }
  });
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("ctfl_theme") || "auto"; }
    catch { return "auto"; }
  });

  useEffect(() => {
    if (!activeCert) return; // rotas neutras (/, /select) não persistem
    saveProgress(progress, activeCert);
  }, [progress, activeCert]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
  }, [lang]);

  useEffect(() => {
    if (!isNotificationSupported()) return;

    const checkAndNotify = () => {
      const days = daysSinceLastStudy(progress.lastStudyDate);
      const dueCount = getDueItems(progress, ALL.map((q) => q.id)).length;

      if (Notification.permission === "granted") {
        if (dueCount > 0) {
          showLocalNotification(
            "Synapse",
            t(lang, "notifications.dueBody", { count: dueCount })
          );
        } else if (days !== null && days >= 3) {
          showLocalNotification(
            "Synapse",
            t(lang, "notifications.staleBody", { days })
          );
        }
      }
    };

    // roda 1x ao abrir o app (não em loop) — checagem simples, sem agendamento
    // em background real (isso exigiria push server, fora do escopo "local")
    checkAndNotify();
  }, []); // só na montagem inicial

  const onAnswer = (domain, correct, questionId) =>
    setProgress((p) => recordAnswer(p, domain, correct, questionId, bank));

  function dismissOnboarding() {
    try { localStorage.setItem("ctfl_onboarding_done", "1"); } catch {}
    setShowOnboarding(false);
  }

  function toggleLang() {
    const next = lang === "pt" ? "en" : "pt";
    try { localStorage.setItem("ctfl_lang", next); } catch {}
    setLang(next);
  }

  function cycleTheme() {
    const next = theme === "auto" ? "light" : theme === "light" ? "dark" : "auto";
    try { localStorage.setItem("ctfl_theme", next); } catch {}
    setTheme(next);
  }

  return (
    <div className="app" {...(activeCert ? { "data-cert": activeCert } : {})}>
      <header className="masthead">
        <div className="mast-mark" aria-hidden="true"><BrandMark size={26} /></div>
        <div>
          <h1>{catalogCert ? catalogCert.fullName : "Synapse"}</h1>
          {catalogCert && (
            <p className="mast-sub">
              ISTQB {catalogCert.label} {catalogCert.version} · {ALL.length} {t(lang, "questionsCount")}
            </p>
          )}
        </div>
        {activeCert && (
          <Link className="cert-indicator" to="/select" aria-label={t(lang, "changeCert")}>
            {catalogCert.label}
          </Link>
        )}
        <button
          className="btn ghost lang-toggle"
          onClick={toggleLang}
          aria-label={t(lang, lang === "pt" ? "langToggleToEn" : "langToggleToPt")}
        >
          {lang === "pt" ? "PT" : "EN"}
        </button>
        <button
          className="btn ghost theme-toggle"
          onClick={cycleTheme}
          aria-label={t(lang, theme === "auto" ? "themeAuto" : theme === "light" ? "themeLight" : "themeDark")}
        >
          {theme === "auto" ? "🌗" : theme === "light" ? "☀️" : "🌙"}
        </button>
      </header>

      {showOnboarding ? (
        <Onboarding onDismiss={dismissOnboarding} lang={lang} />
      ) : (
        <Routes>
          <Route path="/" element={<RootRedirect lang={lang} />} />
          <Route path="/select" element={<CertSelector lang={lang} />} />

          {/* key={certId}: força remount na troca de cert (mesmo padrão de
              rota /:cert/*), senão estado local (useReducer do Quiz etc.)
              vaza do cert antigo pro novo. */}
          <Route path="/:cert/quiz" element={
            <CertGuard key={certId}>
              <TabNav lang={lang} />
              <main><CertRouteQuiz quizFilter={quizFilter} setQuizFilter={setQuizFilter} onAnswer={onAnswer} progress={progress} setProgress={setProgress} lang={lang} /></main>
            </CertGuard>
          } />
          <Route path="/:cert/syllabus" element={
            <CertGuard key={certId}>
              <TabNav lang={lang} />
              <main><CertRouteSyllabus setQuizFilter={setQuizFilter} lang={lang} progress={progress} /></main>
            </CertGuard>
          } />
          <Route path="/:cert/flash" element={
            <CertGuard key={certId}>
              <TabNav lang={lang} />
              <main><Flashcards lang={lang} progress={progress} setProgress={setProgress} /></main>
            </CertGuard>
          } />
          <Route path="/:cert/glossary" element={
            <CertGuard key={certId}>
              <TabNav lang={lang} />
              <main><Glossary lang={lang} progress={progress} /></main>
            </CertGuard>
          } />
          <Route path="/:cert/stats" element={
            <CertGuard key={certId}>
              <TabNav lang={lang} />
              <main><CertRouteStats progress={progress} setProgress={setProgress} lang={lang} /></main>
            </CertGuard>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}

      <footer className="foot">
        {t(lang, "footer")}
        <span style={{marginLeft: '1rem', opacity: 0.5}}>v{__APP_VERSION__}</span>
      </footer>
    </div>
  );
}

/* ─── Thin wrappers that need useParams/useNavigate inside the Route tree ─── */
function CertRouteQuiz({ quizFilter, setQuizFilter, onAnswer, progress, setProgress, lang }) {
  const { cert } = useParams();
  const navigate = useNavigate();
  return (
    <Quiz
      onAnswer={onAnswer}
      progress={progress}
      setProgress={setProgress}
      initialFilter={quizFilter}
      onFilterConsumed={() => setQuizFilter(null)}
      onStudyChapter={(domain) => {
        setQuizFilter({ domain });
        navigate(`/${cert}/quiz`);
      }}
      lang={lang}
    />
  );
}

function CertRouteSyllabus({ setQuizFilter, lang, progress }) {
  const { cert } = useParams();
  const navigate = useNavigate();
  return (
    <Syllabus
      onStudy={(domain) => { setQuizFilter({ domain }); navigate(`/${cert}/${DEFAULT_SECTION}`); }}
      lang={lang}
      progress={progress}
    />
  );
}

function CertRouteStats({ progress, setProgress, lang }) {
  const { cert } = useParams();
  const navigate = useNavigate();
  return (
    <Stats
      progress={progress}
      setProgress={setProgress}
      lang={lang}
      onGoToQuiz={() => navigate(`/${cert}/${DEFAULT_SECTION}`)}
    />
  );
}
