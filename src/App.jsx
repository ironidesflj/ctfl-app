import { useState, useEffect } from "react";
import Quiz from "./components/Quiz.jsx";
import Flashcards from "./components/Flashcards.jsx";
import Syllabus from "./components/Syllabus.jsx";
import Stats from "./components/Stats.jsx";
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

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const onAnswer = (domain, correct, questionId) =>
    setProgress((p) => recordAnswer(p, domain, correct, questionId));

  return (
    <div className="app">
      <header className="masthead">
        <div className="mast-mark" aria-hidden="true">CT</div>
        <div>
          <h1>CTFL Prep</h1>
          <p className="mast-sub">ISTQB Foundation Level v4.0 · {META.total} questões</p>
        </div>
      </header>

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
            initialFilter={quizFilter}
            onFilterConsumed={() => setQuizFilter(null)}
          />
        )}
        {tab === "syllabus" && (
          <Syllabus onStudy={(domain) => { setQuizFilter({ domain }); setTab("quiz"); }} />
        )}
        {tab === "flash" && <Flashcards />}
        {tab === "stats" && <Stats progress={progress} setProgress={setProgress} />}
      </main>

      <footer className="foot">
        Material de estudo independente, não afiliado ao ISTQB.
        <span style={{marginLeft: '1rem', opacity: 0.5}}>v{__APP_VERSION__}</span>
      </footer>
    </div>
  );
}
