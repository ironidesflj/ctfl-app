import { useState, useEffect } from "react";
import Quiz from "./components/Quiz.jsx";
import Flashcards from "./components/Flashcards.jsx";
import Syllabus from "./components/Syllabus.jsx";
import Glossary from "./components/Glossary.jsx";
import Stats from "./components/Stats.jsx";
import Onboarding from "./components/Onboarding.jsx";
import { loadProgress, saveProgress, recordAnswer, getDueItems } from "./lib/storage.js";
import { META, ALL } from "./lib/bank.js";
import { t } from "./lib/ui-strings.js";
import { isNotificationSupported, showLocalNotification, daysSinceLastStudy } from "./lib/notifications.js";

export default function App() {
  const [tab, setTab] = useState("quiz");
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

  const TABS = [
    { id: "quiz", label: t(lang, "tabs.quiz") },
    { id: "syllabus", label: t(lang, "tabs.syllabus") },
    { id: "flash", label: t(lang, "tabs.flashcards") },
    { id: "glossary", label: t(lang, "tabs.glossary") },
    { id: "stats", label: t(lang, "tabs.progress") }
  ];

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
        <>
          <nav className="tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={"tab" + (tab === t.id ? " active" : "")}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <main>
            {tab === "quiz" && (
              <Quiz
                onAnswer={onAnswer}
                progress={progress}
                setProgress={setProgress}
                initialFilter={quizFilter}
                onFilterConsumed={() => setQuizFilter(null)}
                lang={lang}
              />
            )}
            {tab === "syllabus" && (
              <Syllabus onStudy={(domain) => { setQuizFilter({ domain }); setTab("quiz"); }} lang={lang} progress={progress} />
            )}
            {tab === "flash" && <Flashcards lang={lang} progress={progress} setProgress={setProgress} />}
            {tab === "glossary" && <Glossary lang={lang} />}
            {tab === "stats" && <Stats progress={progress} setProgress={setProgress} lang={lang} onGoToQuiz={() => setTab("quiz")} />}
          </main>
        </>
      )}

      <footer className="foot">
        {t(lang, "footer")}
        <span style={{marginLeft: '1rem', opacity: 0.5}}>v{__APP_VERSION__}</span>
      </footer>
    </div>
  );
}
