import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Quiz from "./components/Quiz.jsx";
import Flashcards from "./components/Flashcards.jsx";
import Syllabus from "./components/Syllabus.jsx";
import Glossary from "./components/Glossary.jsx";
import Stats from "./components/Stats.jsx";
import Onboarding from "./components/Onboarding.jsx";
import CertSelector from "./components/CertSelector.jsx";
import BrandMark from "./components/BrandMark.jsx";
import InstallPrompt from "./components/InstallPrompt.jsx";
import UpdateToast from "./components/UpdateToast.jsx";
import ReleaseNotesModal from "./components/ReleaseNotesModal.jsx";
import {
  loadProgress,
  saveProgress,
  recordAnswer,
  getDueItems,
  setActiveCertForStorage,
} from "./lib/storage.js";
import { getSetting, setSetting, migrateSettings, isOnboardingDone } from "./lib/settings.js";
import { getBank, isBankLoaded, loadBankFor } from "./lib/bank.js";
import { warmServiceWorkerCache } from "./lib/pwa.js";
import { t } from "./lib/ui-strings.js";
import {
  isNotificationSupported,
  showLocalNotification,
  daysSinceLastStudy,
} from "./lib/notifications.js";
import { readReminderCfg, scheduleDailyReminder, reminderGoalCount } from "./lib/reminder.js";
import { VALID_CERTS, DEFAULT_SECTION, LAST_CERT_KEY } from "./certs.js";
import { CATALOG_BY_ID } from "./certs-catalog.js";
import { markCurrentReleaseSeen } from "./lib/releases.js";
import { FEEDBACK_URL } from "./lib/external-links.js";

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

/* ─── r5: splash enquanto o chunk do banco chega ───
   O banco agora é um chunk lazy por cert (code-split). O BankGate mostra
   este splash nas rotas de cert até a fatia estar disponível; na prática é
   um piscar (chunk local + prefetch no boot). */
function BankSplash({ lang }) {
  return (
    <div className="bank-splash" role="status" aria-live="polite">
      <div className="bank-splash-mark" aria-hidden="true">
        <BrandMark size={42} />
      </div>
      <p className="muted">{t(lang, "loading.bank")}</p>
    </div>
  );
}

/* ─── r5: guarda de banco — só renderiza a rota de cert com a fatia pronta.
   Re-avalia isBankLoaded a cada render do App (o incremento de bankTick
   re-renderiza a árvore toda quando um loadBankFor conclui — o splash
   troca pelo conteúdo no mesmo render). ─── */
function BankGate({ children, lang }) {
  const { cert } = useParams();
  if (!isBankLoaded(cert)) return <BankSplash lang={lang} />;
  return children;
}

/* ─── Root: volta pro último cert salvo, ou cai na tela de seleção ─── */
function RootRedirect({ lang }) {
  let last;
  try {
    last = localStorage.getItem(LAST_CERT_KEY);
  } catch {
    /* ignore */
  }
  if (last && VALID_CERTS.includes(last)) {
    return <Navigate to={`/${last}/${DEFAULT_SECTION}`} replace />;
  }
  // sem cert salvo (1ª visita / storage limpo): tela dedicada, não fallback fixo
  return <CertSelector lang={lang} />;
}

/* ─── r10: rotas neutras /go/:tab — atalhos do PWA e links compartilháveis.
   O cert não pode ser gravado no atalho (shortcuts do manifest são
   estáticos); a rota resolve pro ÚLTIMO cert usado e redireciona. Sem cert
   salvo, cai na seleção (mesma política do RootRedirect). ─── */
const GO_TABS = ["quiz", "syllabus", "flash", "glossary", "stats"];
function GoRedirect() {
  const { tab } = useParams();
  let last;
  try {
    last = localStorage.getItem(LAST_CERT_KEY);
  } catch {
    /* ignore */
  }
  const target = GO_TABS.includes(tab) ? tab : DEFAULT_SECTION;
  if (last && VALID_CERTS.includes(last)) {
    return <Navigate to={`/${last}/${target}`} replace />;
  }
  return <Navigate to="/" replace />;
}

/* ─── Tab navigation (reads cert from URL) ─── */
function TabNav({ lang }) {
  const { cert } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const tabRefs = useRef({});

  const TABS = [
    { id: "quiz", label: t(lang, "tabs.quiz") },
    { id: "syllabus", label: t(lang, "tabs.syllabus") },
    { id: "flash", label: t(lang, "tabs.flashcards") },
    { id: "glossary", label: t(lang, "tabs.glossary") },
    { id: "stats", label: t(lang, "tabs.progress") },
  ];

  const activeTabId = location.pathname.split("/")[2] || "quiz";
  const activeIndex = Math.max(
    0,
    TABS.findIndex((tb) => tb.id === activeTabId)
  );

  function handleKeyDown(e) {
    let nextIndex = activeIndex;
    if (e.key === "ArrowRight") nextIndex = (activeIndex + 1) % TABS.length;
    else if (e.key === "ArrowLeft") nextIndex = (activeIndex - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = TABS.length - 1;
    else return;
    e.preventDefault();
    const nextId = TABS[nextIndex].id;
    navigate(`/${cert}/${nextId}`);
    // Focus the new tab after the DOM updates — NOT on every render.
    // requestAnimationFrame avoids stealing focus during normal re-renders
    // (e.g. when progress changes in the Quiz); only keyboard navigation triggers it.
    requestAnimationFrame(() => tabRefs.current[nextId]?.focus({ preventScroll: true }));
  }

  return (
    <nav className="tabs" role="tablist" aria-label={t(lang, "aria.sections")}>
      {TABS.map((tb) => {
        const isActive = location.pathname === `/${cert}/${tb.id}`;
        return (
          <button
            key={tb.id}
            id={`tab-${cert}-${tb.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${cert}`}
            tabIndex={isActive ? 0 : -1}
            className={"tab" + (isActive ? " active" : "")}
            onClick={() => navigate(`/${cert}/${tb.id}`)}
            onKeyDown={handleKeyDown}
            ref={(el) => {
              tabRefs.current[tb.id] = el;
            }}
          >
            {tb.label}
          </button>
        );
      })}
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

  // r5: code-split — o banco do cert ativo é um chunk lazy. bankTick avisa
  // a árvore toda (BankGate incluso) quando loadBankFor() conclui.
  const [bankTick, setBankTick] = useState(0);
  useEffect(() => {
    // prefetch no boot: já baixa a fatia do último cert usado, mesmo na
    // "/" ou "/select" — quando o usuário escolhe, o banco já chegou.
    // r7: após o chunk chegar, re-aquece o cache do SW — o fetch inicial
    // pode ter acontecido antes do clients.claim (janela da 1ª visita).
    let last = null;
    try {
      last = localStorage.getItem(LAST_CERT_KEY);
    } catch {
      /* ignore */
    }
    const first = last && VALID_CERTS.includes(last) ? last : "ctfl";
    loadBankFor(first)
      .then(() => {
        setBankTick((x) => x + 1);
        return warmServiceWorkerCache();
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!activeCert || isBankLoaded(activeCert)) return;
    let alive = true;
    loadBankFor(activeCert)
      .then(() => {
        if (alive) {
          setBankTick((x) => x + 1);
          return warmServiceWorkerCache();
        }
      })
      .catch(() => {
        /* BankGate mantém o splash; sem crash */
      });
    return () => {
      alive = false;
    };
  }, [activeCert]);

  const bank = useMemo(() => {
    if (!isBankLoaded(certId)) return null;
    try {
      return getBank(certId);
    } catch {
      return null;
    }
    // bankTick não é lido no corpo: é gatilho intencional de invalidação —
    // sem ele o cache manteria null depois de o chunk lazy terminar de carregar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certId, bankTick]);
  const ALL = bank ? bank.ALL : [];
  const srsScope = useMemo(() => (bank ? bank.STUDY || bank.ALL : []), [bank]);
  const catalogCert = activeCert ? CATALOG_BY_ID[activeCert] : null;
  // Progresso é por cert (namespaced em storage.js por certId). Recarrega
  // sempre que activeCert muda; em rotas neutras (/, /select) não há cert
  // ativo pra persistir, então mantém o último progresso carregado só em
  // memória (o effect de save abaixo pula quando !activeCert).
  const [progress, setProgress] = useState(() => {
    setActiveCertForStorage(certId);
    return loadProgress(certId);
  });

  // P2/lint: ajuste de estado durante render (padrão "adjusting state when
  // props change" do react.dev), em vez de effect de load. Além de eliminar o
  // set-state-in-effect, corrige a corrida na troca de cert: com o load em
  // effect, o effect de save (abaixo) chegava a gravar o progresso do cert
  // ANTIGO sob a chave do NOVO antes do reload autocorrigir. Ajustes durante
  // render descartam o render intermediário — nenhum effect vê estado misto.
  const [prevActiveCert, setPrevActiveCert] = useState(activeCert);
  if (activeCert && prevActiveCert !== activeCert) {
    setPrevActiveCert(activeCert);
    setProgress(loadProgress(activeCert));
  }
  // O ponteiro de storage ainda precisa ser sincronizado fora do render —
  // effect puro, sem setState.
  useEffect(() => {
    if (activeCert) setActiveCertForStorage(activeCert);
  }, [activeCert]);

  const [quizFilter, setQuizFilter] = useState(null);
  // r4: preferências migradas ctfl_* → synapse.* (settings.js). A migração
  // roda no primeiro initializer — ANTES de qualquer getSetting — para que o
  // boot logo após a atualização já veja os valores legados sob as chaves novas.
  const [showOnboarding, setShowOnboarding] = useState(() => {
    migrateSettings();
    return !isOnboardingDone();
  });
  // `reentry` preserva o resumo de métricas aberto pelo Stats; `about` mostra
  // a apresentação institucional completa. Os dois usam o mesmo diálogo para
  // manter foco, rota e progresso sem duplicar navegação ou estado.
  const [onboardingOverlay, setOnboardingOverlay] = useState(null);
  const hasOnboardingOverlay = onboardingOverlay !== null;
  // r3: modal de re-entrada acessível — role=dialog + aria-modal, focus trap
  // (Tab cicla dentro do modal), Esc fecha e o foco volta pro elemento que
  // abriu (o botão "Como funciona?" da aba Progresso). Antes o overlay era
  // só um div visual: usuários de teclado/tabulação escapavam pro conteúdo
  // oculto atrás e leitores de tela não anunciavam o diálogo.
  const overlayRef = useRef(null);
  const lastFocusedRef = useRef(null);
  useEffect(() => {
    if (!hasOnboardingOverlay) return;
    lastFocusedRef.current = document.activeElement;
    document.body.style.overflow = "hidden";
    const overlay = overlayRef.current;
    if (overlay) {
      const focusables = overlay.querySelectorAll(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const initial = overlay.querySelector(".ob-close") || focusables[0];
      if (initial) requestAnimationFrame(() => initial.focus());
    }
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOnboardingOverlay(null);
        return;
      }
      if (e.key !== "Tab") return;
      const scope = overlayRef.current;
      if (!scope) return;
      const focusables = [
        ...scope.querySelectorAll(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ),
      ].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      const previousFocus = lastFocusedRef.current;
      requestAnimationFrame(() => {
        const returnTarget = previousFocus?.isConnected
          ? previousFocus
          : document.getElementById("about-synapse-trigger");
        if (returnTarget && typeof returnTarget.focus === "function") {
          returnTarget.focus({ preventScroll: true });
        }
      });
    };
  }, [hasOnboardingOverlay]);

  const [lang, setLang] = useState(() => getSetting("lang"));
  const [theme, setTheme] = useState(() => getSetting("theme"));

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

  const notifOnceRef = useRef(false);
  useEffect(() => {
    if (!isNotificationSupported()) return;

    // r5: com o banco lazy, o ALL só existe depois do chunk chegar — a
    // checagem roda quando o banco fica disponível (ref guarda a
    // semântica original de "1x por sessão do app", não por cert).
    if (notifOnceRef.current || !bank) return;
    notifOnceRef.current = true;

    const checkAndNotify = () => {
      const days = daysSinceLastStudy(progress.lastStudyDate);
      const dueCount = getDueItems(
        progress,
        srsScope.map((q) => q.id)
      ).length;

      if (Notification.permission === "granted") {
        if (dueCount > 0) {
          showLocalNotification("Synapse", t(lang, "notifications.dueBody", { count: dueCount }));
        } else if (days !== null && days >= 3) {
          showLocalNotification("Synapse", t(lang, "notifications.staleBody", { days }));
        }
      }
    };

    checkAndNotify();
  }, [bank, srsScope, lang, progress]); // ref-guarded: executa 1x por sessão

  // r10: lembrete diário — agenda o disparo quando ativo (settings +
  // permissão concedida). O Stats muda a config e emite
  // "synapse:reminder-changed"; este efeito re-lê e re-agenda na hora
  // (mesmo padrão de comunicação Settings → App sem prop drilling).
  const [reminderCfg, setReminderCfg] = useState(readReminderCfg);
  useEffect(() => {
    const onCfgChange = () => setReminderCfg(readReminderCfg());
    window.addEventListener("synapse:reminder-changed", onCfgChange);
    return () => window.removeEventListener("synapse:reminder-changed", onCfgChange);
  }, []);
  useEffect(() => {
    if (!reminderCfg.enabled) return undefined;
    // Notificações locais só disparam com o app aberto — guardas de
    // suporte/permissão evitam agendar algo que nunca tocará.
    if (!isNotificationSupported() || Notification.permission !== "granted") return undefined;
    return scheduleDailyReminder(reminderCfg.time, () => {
      // data.go → notificationclick do sw.js navega pro quiz (último cert)
      showLocalNotification(
        "Synapse",
        t(lang, "notifications.reminderBody", { n: reminderGoalCount() }),
        { data: { go: "quiz" } }
      );
    });
  }, [reminderCfg, lang]);

  const onAnswer = (domain, correct, questionId) =>
    setProgress((p) => recordAnswer(p, domain, correct, questionId, bank));

  function dismissOnboarding() {
    setSetting("onboardingDone", "1");
    // Primeira visita já recebeu a apresentação completa do produto; evita
    // empilhar o modal de release logo depois do onboarding da mesma versão.
    markCurrentReleaseSeen();
    setShowOnboarding(false);
  }

  function closeReentryOnboarding() {
    setOnboardingOverlay(null);
  }

  function toggleLang() {
    const next = lang === "pt" ? "en" : "pt";
    setSetting("lang", next);
    setLang(next);
  }

  function cycleTheme() {
    const next = theme === "auto" ? "light" : theme === "light" ? "dark" : "auto";
    setSetting("theme", next);
    setTheme(next);
  }

  return (
    <div className="app" {...(activeCert ? { "data-cert": activeCert } : {})}>
      {!hasOnboardingOverlay && (
        <header className="masthead">
          <div
            className="mast-mark"
            role="img"
            aria-label={
              catalogCert ? t(lang, "aria.mastMark", { cert: catalogCert.label }) : "Synapse"
            }
          >
            <BrandMark size={26} />
          </div>
          <div>
            <h1>{catalogCert ? catalogCert.fullName : "Synapse"}</h1>
            {catalogCert && (
              <p className="mast-sub">
                ISTQB {catalogCert.label} {catalogCert.version} · {ALL.length}{" "}
                {t(lang, "questionsCount")}
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
            aria-label={t(
              lang,
              theme === "auto" ? "themeAuto" : theme === "light" ? "themeLight" : "themeDark"
            )}
          >
            {theme === "auto" ? "🌗" : theme === "light" ? "☀️" : "🌙"}
          </button>
        </header>
      )}

      {showOnboarding ? (
        <Onboarding onDismiss={dismissOnboarding} lang={lang} />
      ) : (
        <Routes>
          <Route path="/" element={<RootRedirect lang={lang} />} />
          <Route path="/select" element={<CertSelector lang={lang} />} />
          {/* r10: atalhos da PWA (manifest shortcuts) apontam pra cá — a rota
              resolve pro último cert usado e redireciona. */}
          <Route path="/go/:tab" element={<GoRedirect />} />

          {/* key={certId}: força remount na troca de cert (mesmo padrão de
              rota /:cert/*), senão estado local (useReducer do Quiz etc.)
              vaza do cert antigo pro novo. */}
          <Route
            path="/:cert/quiz"
            element={
              <CertGuard key={certId}>
                <TabNav lang={lang} />
                <main
                  role="tabpanel"
                  id={`tabpanel-${certId}`}
                  aria-labelledby={`tab-${certId}-quiz`}
                >
                  <BankGate lang={lang}>
                    <CertRouteQuiz
                      quizFilter={quizFilter}
                      setQuizFilter={setQuizFilter}
                      onAnswer={onAnswer}
                      progress={progress}
                      setProgress={setProgress}
                      lang={lang}
                    />
                  </BankGate>
                </main>
              </CertGuard>
            }
          />
          <Route
            path="/:cert/syllabus"
            element={
              <CertGuard key={certId}>
                <TabNav lang={lang} />
                <main
                  role="tabpanel"
                  id={`tabpanel-${certId}`}
                  aria-labelledby={`tab-${certId}-syllabus`}
                >
                  <BankGate lang={lang}>
                    <CertRouteSyllabus
                      setQuizFilter={setQuizFilter}
                      lang={lang}
                      progress={progress}
                    />
                  </BankGate>
                </main>
              </CertGuard>
            }
          />
          <Route
            path="/:cert/flash"
            element={
              <CertGuard key={certId}>
                <TabNav lang={lang} />
                <main
                  role="tabpanel"
                  id={`tabpanel-${certId}`}
                  aria-labelledby={`tab-${certId}-flash`}
                >
                  <BankGate lang={lang}>
                    <Flashcards lang={lang} progress={progress} setProgress={setProgress} />
                  </BankGate>
                </main>
              </CertGuard>
            }
          />
          <Route
            path="/:cert/glossary"
            element={
              <CertGuard key={certId}>
                <TabNav lang={lang} />
                <main
                  role="tabpanel"
                  id={`tabpanel-${certId}`}
                  aria-labelledby={`tab-${certId}-glossary`}
                >
                  <BankGate lang={lang}>
                    <Glossary lang={lang} progress={progress} />
                  </BankGate>
                </main>
              </CertGuard>
            }
          />
          <Route
            path="/:cert/stats"
            element={
              <CertGuard key={certId}>
                <TabNav lang={lang} />
                <main
                  role="tabpanel"
                  id={`tabpanel-${certId}`}
                  aria-labelledby={`tab-${certId}-stats`}
                >
                  <BankGate lang={lang}>
                    <CertRouteStats
                      progress={progress}
                      setProgress={setProgress}
                      lang={lang}
                      setQuizFilter={setQuizFilter}
                      onReopenOnboarding={() => setOnboardingOverlay("reentry")}
                    />
                  </BankGate>
                </main>
              </CertGuard>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}

      {!showOnboarding && hasOnboardingOverlay && (
        <div
          className="onboarding-overlay"
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={t(
            lang,
            onboardingOverlay === "about" ? "onboarding.aboutAria" : "onboarding.reentryAria"
          )}
        >
          <Onboarding variant={onboardingOverlay} onDismiss={closeReentryOnboarding} lang={lang} />
        </div>
      )}

      {!showOnboarding && (
        <footer className="foot" hidden={hasOnboardingOverlay}>
          <div>
            {t(lang, "footer")}
            <span className="foot-version">v{__APP_VERSION__}</span>
          </div>
          <nav className="foot-actions" aria-label={t(lang, "footerLinksAria")}>
            <button
              id="about-synapse-trigger"
              type="button"
              className="foot-link"
              onClick={() => setOnboardingOverlay("about")}
            >
              {t(lang, "aboutSynapse")}
            </button>
            <a className="foot-link" href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer">
              {t(lang, "sendFeedback")} ↗
            </a>
          </nav>
          <p className="foot-privacy">{t(lang, "feedbackPublicShort")}</p>
        </footer>
      )}

      {/* r7: prompt de instalação da PWA — pill flutuante; some sozinho
          quando instalado/dispensado/sem suporte. */}
      <InstallPrompt lang={lang} />
      {/* Release significativa: aparece uma vez por versão depois que a nova
          versão carregou. Primeira visita é suprimida em dismissOnboarding. */}
      {!showOnboarding && !hasOnboardingOverlay && <ReleaseNotesModal lang={lang} />}
      {/* r8: toast de atualização do SW — aparece quando um novo SW está
          esperando; recarrega só quando o usuário aceita. PROD-only. */}
      <UpdateToast lang={lang} />
    </div>
  );
}

/* ─── Thin wrappers that need useParams/useNavigate inside the Route tree ─── */
function CertRouteQuiz({ quizFilter, setQuizFilter, onAnswer, progress, setProgress, lang }) {
  const { cert } = useParams();
  const navigate = useNavigate();
  const handleFilterConsumed = useCallback(() => setQuizFilter(null), [setQuizFilter]);
  return (
    <Quiz
      onAnswer={onAnswer}
      progress={progress}
      setProgress={setProgress}
      initialFilter={quizFilter}
      onFilterConsumed={handleFilterConsumed}
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
      onStudy={(domain) => {
        setQuizFilter({ domain });
        navigate(`/${cert}/${DEFAULT_SECTION}`);
      }}
      lang={lang}
      progress={progress}
    />
  );
}

function CertRouteStats({ progress, setProgress, lang, onReopenOnboarding, setQuizFilter }) {
  const { cert } = useParams();
  const navigate = useNavigate();
  return (
    <Stats
      progress={progress}
      setProgress={setProgress}
      lang={lang}
      onReopenOnboarding={onReopenOnboarding}
      // r6: domínio opcional pré-seleciona o capítulo no setup do Quiz
      // (mesma mecânica do deep-link "Estudar este capítulo" do Syllabus —
      // quizFilter {domain} + APPLY_INITIAL_FILTER). Sem arg = navegação
      // simples (usado pelo empty-state do Stats).
      onGoToQuiz={(domain) => {
        if (domain !== undefined) setQuizFilter({ domain });
        navigate(`/${cert}/${DEFAULT_SECTION}`);
      }}
    />
  );
}
