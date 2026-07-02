import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from "react-router-dom";
import Quiz from "./components/Quiz.jsx";
import Flashcards from "./components/Flashcards.jsx";
import Syllabus from "./components/Syllabus.jsx";
import Glossary from "./components/Glossary.jsx";
import Stats from "./components/Stats.jsx";
import Onboarding from "./components/Onboarding.jsx";
import { loadProgress, saveProgress, recordAnswer, getDueItems } from "./lib/storage.js";
import { getBank } from "./lib/bank.js";
import { t } from "./lib/ui-strings.js";
import { isNotificationSupported, showLocalNotification, daysSinceLastStudy } from "./lib/notifications.js";
import { VALID_CERTS, DEFAULT_SECTION, LAST_CERT_KEY } from "./certs.js";

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

/* ─── Root redirect: restores last cert or falls back to ctfl ─── */
function RootRedirect() {
  let last;
  try { last = localStorage.getItem(LAST_CERT_KEY); } catch { /* ignore */ }
  if (last && VALID_CERTS.includes(last)) {
    return <Navigate to={`/${last}/${DEFAULT_SECTION}`} replace />;
  }
  // TODO Fase 5 Briefing 2: virar tela de seleção de certificação
  return <Navigate to={`/ctfl/${DEFAULT_SECTION}`} replace />;
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
  const certId = (location.pathname.split("/")[1] || "ctfl").toLowerCase();
  
  const bank = useMemo(() => {
    try { return getBank(certId); }
    catch { return getBank("ctfl"); }
  }, [certId]);
  const { META, ALL } = bank;
  const [progress, setProgress] = useState(loadProgress);
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
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!isNotificationSupported()) return;

    const checkAndNotify = () => {
      const days = daysSinceLastStudy(progress.lastStudyDate);
      const dueCount = getDueItems(progress, ALL.map((q) => q.id)).length;

      if (Notification.permission === "granted") {
        if (dueCount > 0) {
          showLocalNotification(
            "CTFL Prep",
            `Você tem ${dueCount} questão(ões) para revisar hoje.`
          );
        } else if (days !== null && days >= 3) {
          showLocalNotification(
            "CTFL Prep",
            `Você não estuda há ${days} dias. Que tal uma sessão rápida?`
          );
        }
      }
    };

    // roda 1x ao abrir o app (não em loop) — checagem simples, sem agendamento
    // em background real (isso exigiria push server, fora do escopo "local")
    checkAndNotify();
  }, []); // só na montagem inicial

  const onAnswer = (domain, correct, questionId) =>
    setProgress((p) => recordAnswer(p, domain, correct, questionId));

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
    <div className="app">
      <header className="masthead">
        <div className="mast-mark" aria-hidden="true">CT</div>
        <div>
          <h1>CTFL Prep</h1>
          <p className="mast-sub">ISTQB Foundation Level v4.0 · {META.total} {t(lang, "questionsCount")}</p>
        </div>
        <button className="btn ghost lang-toggle" onClick={toggleLang}>
          {lang === "pt" ? "PT" : "EN"}
        </button>
        <button className="btn ghost theme-toggle" onClick={cycleTheme}>
          {theme === "auto" ? "🌗" : theme === "light" ? "☀️" : "🌙"}
        </button>
      </header>

      {showOnboarding ? (
        <Onboarding onDismiss={dismissOnboarding} lang={lang} />
      ) : (
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          <Route path="/:cert/quiz" element={
            <CertGuard>
              <TabNav lang={lang} />
              <main><CertRouteQuiz quizFilter={quizFilter} setQuizFilter={setQuizFilter} onAnswer={onAnswer} progress={progress} setProgress={setProgress} lang={lang} /></main>
            </CertGuard>
          } />
          <Route path="/:cert/syllabus" element={
            <CertGuard>
              <TabNav lang={lang} />
              <main><CertRouteSyllabus setQuizFilter={setQuizFilter} lang={lang} progress={progress} /></main>
            </CertGuard>
          } />
          <Route path="/:cert/flash" element={
            <CertGuard>
              <TabNav lang={lang} />
              <main><Flashcards lang={lang} progress={progress} setProgress={setProgress} /></main>
            </CertGuard>
          } />
          <Route path="/:cert/glossary" element={
            <CertGuard>
              <TabNav lang={lang} />
              <main><Glossary lang={lang} progress={progress} /></main>
            </CertGuard>
          } />
          <Route path="/:cert/stats" element={
            <CertGuard>
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
  return (
    <Quiz
      onAnswer={onAnswer}
      progress={progress}
      setProgress={setProgress}
      initialFilter={quizFilter}
      onFilterConsumed={() => setQuizFilter(null)}
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
