import { useState, useEffect } from "react";
import Quiz from "./components/Quiz.jsx";
import Flashcards from "./components/Flashcards.jsx";
import Syllabus from "./components/Syllabus.jsx";
import Stats from "./components/Stats.jsx";
import Onboarding from "./components/Onboarding.jsx";
import { loadProgress, saveProgress, recordAnswer } from "./lib/storage.js";
import { META } from "./lib/bank.js";

const TABS = [
  { id: "quiz", label: "Quiz" },
  { id: "syllabus", label: "Syllabus" },
  { id: "flash", label: "Flashcards" },
  { id: "stats", label: "Progresso" }
];

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

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

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

  return (
    <div className="app">
      <header className="masthead">
        <div className="mast-mark" aria-hidden="true">CT</div>
        <div>
          <h1>CTFL Prep</h1>
          <p className="mast-sub">ISTQB Foundation Level v4.0 · {META.total} questões</p>
        </div>
        <button className="btn ghost lang-toggle" onClick={toggleLang}>
          {lang === "pt" ? "PT" : "EN"}
        </button>
      </header>

      {showOnboarding ? (
        <Onboarding onDismiss={dismissOnboarding} />
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
              <Syllabus onStudy={(domain) => { setQuizFilter({ domain }); setTab("quiz"); }} lang={lang} />
            )}
            {tab === "flash" && <Flashcards lang={lang} />}
            {tab === "stats" && <Stats progress={progress} setProgress={setProgress} />}
          </main>
        </>
      )}

      <footer className="foot">
        Material de estudo independente, não afiliado ao ISTQB.
        <span style={{marginLeft: '1rem', opacity: 0.5}}>v{__APP_VERSION__}</span>
      </footer>
    </div>
  );
}
