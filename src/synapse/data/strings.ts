/* Synapse · data/strings.ts
   Copy PT/EN da casca e de todas as abas — portado 1:1 do handoff
   (data/certs.js · strings + data/ui.js). Sem conteúdo de prova aqui. */

export interface Strings {
  nav: {
    label: string;
    hoje: string;
    estudar: string;
    simulado: string;
    flashcards: string;
    syllabus: string;
    progresso: string;
    soon: string;
    more: string;
    glossary: string;
    about: string;
    certs: string;
    feedback: string;
    secondary: string;
  };
  cert: {
    label: string;
    change: string;
    choose: string;
    live: string;
    soon: string;
    legacy: string;
    current: string;
  };
  tools: {
    lang: string;
    theme: string;
    light: string;
    dark: string;
  };
  skip: string;
  study: {
    kicker: string;
    nav: string;
    title: string;
    lead: string;
    leadPoints: string;
    next: string;
    chapter: string;
    examShare: string;
    action: string;
    resume: string;
    chapters: string;
    chaptersSub: string;
    chaptersMeta: string;
    examQ: string;
    topics: string;
    studyChapter: string;
    chSeen: string;
    exam: string;
    questions: string;
    time: string;
    cut: string;
    chaptersCount: string;
    version: string;
    status: string;
    last: string;
    source: string;
    coverage: string;
    coverageOf: string;
    coveragePct: string;
    emptyTitle: string;
    emptyBody: string;
    emptyAction: string;
    emptyAside: string;
    footnote: string;
    savedTitle: string;
    savedDesc: string;
    savedNote: string;
    studySaved: string;
    noSaved: string;
  };
  session: {
    exit: string;
    progress: string;
    check: string;
    next: string;
    finish: string;
    correct: string;
    wrong: string;
    rightIs: string;
    back: string;
    done: string;
    score: string;
    scoreOf: string;
    result: string;
    coverageNow: string;
    otherChapter: string;
    source: string;
    needPick: string;
    saved: string;
    save: string;
    unsave: string;
    saveBadge: string;
    savedBadge: string;
    chapterLabel: string;
    answer: string;
    k: string;
    tagCorrect: string;
    tagYours: string;
  };
  a11y: {
    answer: string;
    feedback: string;
    plan: string;
    topics: string;
    coverage: string;
  };
  today: {
    kicker: string;
    title: string;
    lead: string;
    leadOne: string;
    leadDone: string;
    streak: string;
    streakUnit: string;
    streakNone: string;
    check: string;
    checked: string;
    unchecked: string;
    checkNote: string;
    todayCount: string;
    todayNone: string;
    readiness: string;
    readinessSub: string;
    readinessAbove: string;
    readinessBelow: string;
    readinessNoCut: string;
    readinessEmpty: string;
    readinessNone: string;
    readinessCut: string;
    readinessBase: string;
    readinessSee: string;
    week: string;
    weekUnit: string;
    weekEmpty: string;
    tasks: string;
    tasksNote: string;
    taskStudy: string;
    taskStudyBody: string;
    taskStudyMeta: string;
    taskCards: string;
    taskCardsBody: string;
    taskCardsNone: string;
    taskCardsMeta: string;
    taskGap: string;
    taskGapBody: string;
    taskGapMeta: string;
    taskStart: string;
    taskFix: string;
    heroStart: string;
    taskReview: string;
    taskOpen: string;
    taskExam: string;
    taskExamBody: string;
    taskExamBodyCustom: string;
    taskExamMeta: string;
    taskExamMetaNone: string;
    taskExamStart: string;
    last: string;
    lastNone: string;
    exam: string;
    examNone: string;
    examIn: string;
    examToday: string;
    examPast: string;
    examLabel: string;
    examSave: string;
    examClear: string;
    examNote: string;
    footnote: string;
    /* lembrete diário (porta do r10 do v3.18.0) */
    reminderTitle: string;
    reminderDesc: string;
    reminderTimeLabel: string;
    reminderOn: string;
    reminderOff: string;
    reminderBlocked: string;
    reminderBody: string;
    goalAria: string;
    goalLabel: string;
    goalUpdated: string;
  };
  cards: {
    kicker: string;
    title: string;
    lead: string;
    due: string;
    queue: string;
    filter: string;
    all: string;
    front: string;
    back: string;
    flip: string;
    flipHint: string;
    swipeHint: string;
    rate: string;
    again: string;
    hard: string;
    good: string;
    againWhen: string;
    hardWhen: string;
    goodWhen: string;
    counter: string;
    doneTitle: string;
    doneBody: string;
    doneNext: string;
    doneNone: string;
    doneAgain: string;
    emptyTitle: string;
    emptyBody: string;
    reviewAll: string;
    noBankTitle: string;
    noBankBody: string;
    source: string;
    k: string;
    footnote: string;
    dayOne: string;
    now: string;
    dayMany: string;
    undo: string;
    undone: string;
  };
  syllabus: {
    kicker: string;
    title: string;
    lead: string;
    search: string;
    searchEmpty: string;
    colChapter: string;
    colWeight: string;
    colBank: string;
    colCoverage: string;
    weightNote: string;
    sum: string;
    totalWeight: string;
    sourceNote: string;
    topics: string;
    emptyTitle: string;
    emptyBody: string;
    footnote: string;
  };
  progress: {
    kicker: string;
    title: string;
    lead: string;
    coverage: string;
    accuracy: string;
    accuracyNone: string;
    attempts: string;
    readiness: string;
    readinessSub: string;
    readinessCut: string;
    readinessAbove: string;
    readinessBelow: string;
    readinessNoCut: string;
    readinessNote: string;
    readinessEmpty: string;
    readinessNone: string;
    readinessBase: string;
    activity: string;
    activityRange: string;
    activityEmpty: string;
    activityToday: string;
    activityLess: string;
    activityMore: string;
    activityHint: string;
    activityDay: string;
    activityDetail: string;
    activityFuture: string;
    activityNoDay: string;
    reachTitle: string;
    reachSub: string;
    reach: string;
    precision: string;
    reachNote: string;
    reachA11y: string;
    reachNone: string;
    kTitle: string;
    kSub: string;
    kCorrect: string;
    kNone: string;
    kPct: string;
    srsTitle: string;
    srsSub: string;
    srsStarted: string;
    srsDue: string;
    srsMature: string;
    srsRetention: string;
    srsReviews: string;
    srsNone: string;
    srsCta: string;
    srsCtaNone: string;
    srsNote: string;
    feedbackTitle: string;
    feedbackBody: string;
    feedbackCta: string;
    chapters: string;
    chaptersNote: string;
    colCov: string;
    colAcc: string;
    accuracyTitle: string;
    accuracyNote: string;
    history: string;
    historyNone: string;
    historyBody: string;
    weak: string;
    weakNone: string;
    weakRow: string;
    weakMeta: string;
    weakMetaNoAcc: string;
    sessionRow: string;
    when: string;
    whenYesterday: string;
    whenDays: string;
    go: string;
    footnote: string;
    /* conquistas + roadmap (porta do r9 do v3.18.0) */
    stripDays: string;
    stripLevel: string;
    achievementsLabel: string;
    roadmapTitle: string;
    roadmapHint: string;
    roadmapAlmost: string;
    roadmapPct: string;
    roadmapCount: string;
    /* histórico de simulados */
    examHistoryTitle: string;
    examHistorySub: string;
    examRowCustom: string;
    examRowPoints: string;
    examPassed: string;
    examFailed: string;
    examNone: string;
    /* entendendo suas métricas (porta do passo 4.5 do onboarding) */
    howItWorks: string;
    metricsTitle: string;
    metricsReadinessTitle: string;
    metricsReadinessDesc: string;
    metricsPerformanceTitle: string;
    metricsPerformanceDesc: string;
    metricsStreakTitle: string;
    metricsStreakDesc: string;
    metricsLevelTitle: string;
    metricsLevelDesc: string;
    backupTitle: string;
    backupNote: string;
    exportJson: string;
    importJson: string;
    exportCsv: string;
    resetBtn: string;
    resetConfirm: string;
    resetSuccess: string;
    importSuccess: string;
    importError: string;
  };

  simulado: {
    kicker: string;
    title: string;
    lead: string;
    leadPts: string;
    leadNoBank: string;
    poolNote: string;
    poolCount: string;
    official: string;
    officialDesc: string;
    custom: string;
    customDesc: string;
    customChapters: string;
    customAllChapters: string;
    customKLevels: string;
    customAnyK: string;
    customCount: string;
    customMinutes: string;
    customPool: string;
    customPassNote: string;
    customPassNotePts: string;
    customEmpty: string;
    customTag: string;
    explain: string;
    explainPts: string;
    lastWrong: string;
    lastWrongDesc: string;
    draftBanner: string;
    draftInfo: string;
    draftResume: string;
    draftDiscard: string;
    start: string;
    questionOf: string;
    timerLabel: string;
    showGrid: string;
    hideGrid: string;
    gridSummary: string;
    flagOff: string;
    flagOn: string;
    flagAria: string;
    kbdHintLabel: string;
    kbdAnswer: string;
    kbdNavigate: string;
    kbdFlag: string;
    kbdGrid: string;
    prev: string;
    next: string;
    finishExam: string;
    seeResult: string;
    backShort: string;
    timeSummary: string;
    passed: string;
    failed: string;
    excellentMsg: string;
    passedMsg: string;
    failedMsg: string;
    deltaVs: string;
    deltaUp: string;
    deltaDown: string;
    deltaFlat: string;
    weakestChapter: string;
    studyChapter: string;
    backHome: string;
    retakeQuiz: string;
    showReview: string;
    hideReview: string;
    reviewTitle: string;
    reviewBack: string;
    reviewFilterAria: string;
    reviewFilterWrong: string;
    reviewFilterBlank: string;
    reviewFilterFlagged: string;
    reviewFilterCorrect: string;
    reviewFilterAll: string;
    reviewNoItems: string;
    yourAnswer: string;
    correctAnswer: string;
    notAnswered: string;
    timeOnQuestion: string;
    copyResult: string;
    copied: string;
    copyResultText: string;
    trainWrong: string;
    practiceTitle: string;
    practiceBack: string;
    practiceNext: string;
    statusCurrent: string;
    statusAnswered: string;
    statusBlank: string;
    statusFlagged: string;
    gridItemAria: string;
    footnote: string;
  };

  splash: {
    skip: string;
    ready: string;
  };

  onboarding: {
    badge: string;
    hero: string;
    subtitle: string;
    statsQuestions: string;
    statCerts: string;
    statLang: string;
    statFree: string;
    featuresTitle: string;
    featStudyTitle: string;
    featStudyDesc: string;
    featExamTitle: string;
    featExamDesc: string;
    featSrsTitle: string;
    featSrsDesc: string;
    featGlossaryTitle: string;
    featGlossaryDesc: string;
    featProgressTitle: string;
    featProgressDesc: string;
    featBilingualTitle: string;
    featBilingualDesc: string;
    demoTitle: string;
    demoHint: string;
    demoDomain: string;
    demoQuestion: string;
    demoOptA: string;
    demoOptB: string;
    demoOptC: string;
    demoExp: string;
    faqTitle: string;
    faqQ1: string;
    faqA1: string;
    faqQ2: string;
    faqA2: string;
    faqQ3: string;
    faqA3: string;
    faqQ4: string;
    faqA4: string;
    faqQ5: string;
    faqA5: string;
    finalTitle: string;
    cta: string;
    back: string;
    closeAria: string;
    titleAria: string;
    disclaimer: string;
  };

  install: {
    ariaLabel: string;
    title: string;
    hint: string;
    cta: string;
    dismissAria: string;
  };

  update: {
    title: string;
    hint: string;
    cta: string;
    dismissAria: string;
  };
}

const pt: Strings = {
  nav: {
    label: "Navegação principal",
    hoje: "Hoje",
    estudar: "Estudar",
    simulado: "Simulado",
    flashcards: "Flashcards",
    syllabus: "Syllabus",
    progresso: "Progresso",
    soon: "em breve",
    more: "Mais",
    glossary: "Glossário",
    about: "Sobre",
    certs: "Certificações",
    feedback: "Enviar feedback",
    secondary: "Apoio e contexto",
  },
  cert: {
    label: "Certificação",
    change: "Trocar de prova",
    choose: "Escolher certificação",
    live: "disponível",
    soon: "em breve",
    legacy: "legado",
    current: "prova ativa",
  },
  tools: {
    lang: "Idioma da interface",
    theme: "Alternar tema",
    light: "Tema claro",
    dark: "Tema escuro",
  },
  skip: "Pular para o conteúdo",
  study: {
    kicker: "02 · Estudar",
    nav: "Estudar",
    title: "Seu plano até a prova.",
    lead: "A {code} tem {q} questões em {min} minutos. O corte é {pass}. O plano abaixo segue o peso oficial de cada capítulo.",
    leadPoints:
      "A {code} tem {q} questões em {min} minutos, valendo {points} pontos. O corte é {pass} pontos.",
    next: "Próxima sessão",
    chapter: "Capítulo {n}",
    examShare: "{n} das {q} questões do exame",
    action: "Começar estudo",
    resume: "Retomar estudo",
    chapters: "Capítulos",
    chaptersSub: "Cobertura do banco de estudo",
    chaptersMeta: "{n} capítulos · cobertura do banco de estudo",
    examQ: "{n} no exame",
    topics: "{n} tópicos-chave",
    studyChapter: "Estudar este capítulo",
    chSeen: "{seen} de {total} questões vistas",
    exam: "Sua prova",
    questions: "Questões",
    time: "Tempo",
    cut: "Corte",
    chaptersCount: "Capítulos",
    version: "Versão",
    status: "Status",
    last: "Última sessão",
    source: "Fonte",
    coverage: "Cobertura",
    coverageOf: "{seen} de {total} questões de estudo",
    coveragePct: "{pct}%",
    emptyTitle: "Esta prova ainda não tem conteúdo no app.",
    emptyBody:
      "Ainda não há questões desta prova neste dispositivo. O plano aparece aqui assim que o conteúdo chegar.",
    emptyAction: "Voltar para a CTFL",
    emptyAside: "Sem banco de estudo",
    footnote: "Local-first · o progresso fica neste dispositivo",
    savedTitle: "Questões salvas",
    savedDesc: "{n} questão(ões) marcada(s) para revisão",
    savedNote: "Revise as questões que você marcou com estrela durante o estudo.",
    studySaved: "Estudar salvas",
    noSaved: "Nenhuma questão salva ainda",
  },
  session: {
    exit: "Voltar ao plano",
    progress: "Questão {n} de {total}",
    check: "Conferir resposta",
    next: "Próxima questão",
    finish: "Ver resultado",
    correct: "Resposta correta",
    wrong: "Não foi essa",
    rightIs: "A resposta correta é {letter}.",
    back: "Voltar ao plano",
    done: "Sessão concluída.",
    score: "{n} de {total} corretas",
    scoreOf: "/ {total} corretas",
    result: "Resultado",
    coverageNow: "A cobertura do capítulo {ch} agora é {pct}%.",
    otherChapter: "Estudar outro capítulo",
    source: "Fonte",
    needPick: "Escolha uma alternativa para conferir.",
    saved: "Progresso salvo neste dispositivo.",
    save: "Salvar questão",
    unsave: "Remover dos salvos",
    saveBadge: "Salvar",
    savedBadge: "Salva",
    chapterLabel: "Capítulo {n} · {name}",
    answer: "Resposta {letter}",
    k: "K{k}",
    tagCorrect: "correta",
    tagYours: "sua resposta",
  },
  a11y: {
    answer: "Alternativas",
    feedback: "Resultado",
    plan: "Plano de estudo",
    topics: "Tópicos do capítulo",
    coverage: "Cobertura do banco de estudo",
  },
  today: {
    kicker: "01 · Hoje",
    title: "O que rende hoje.",
    lead: "Faltam {n} capítulos para fechar a {code}. Três frentes curtas valem mais que uma sessão longa.",
    leadOne:
      "Falta 1 capítulo para fechar a {code}. Três frentes curtas valem mais que uma sessão longa.",
    leadDone: "Você cobriu todos os capítulos da {code}. Hoje é revisão e conferência.",
    streak: "Sequência",
    streakUnit: "dias",
    streakNone: "Comece hoje",
    check: "Marcar hoje",
    checked: "Hoje marcado",
    unchecked: "Check-in removido",
    checkNote: "Conta sozinho quando você estuda. Sem botão, sem conta.",
    todayCount: "Hoje: {n} ações",
    todayNone: "Hoje ainda não conta.",
    readiness: "Prontidão",
    readinessSub: "peso do blueprint",
    readinessAbove: "acima do corte de {pct}%",
    readinessBelow: "abaixo do corte de {pct}%",
    readinessNoCut: "sem corte definido",
    readinessEmpty: "Ainda sem base. Responda algumas questões para medir.",
    readinessNone: "Sem base ainda",
    readinessCut: "corte {pct}%",
    readinessBase: "Conferências: {n} · acertos: {correct}",
    readinessSee: "Ver no Progresso",
    week: "Últimos 7 dias",
    weekUnit: "questões conferidas",
    weekEmpty: "Sem conferências nos últimos 7 dias.",
    tasks: "Seu dia",
    tasksNote: "Sugestões a partir do seu progresso",
    taskStudy: "Sessão de estudo",
    taskStudyBody: "Seis questões do capítulo {n}, {name}.",
    taskStudyMeta: "{done} de {goal} hoje",
    taskCards: "Revisão de cartões",
    taskCardsBody: "{n} cartões na fila hoje.",
    taskCardsNone: "Nenhum cartão vencido. Revisar mesmo assim mantém o hábito.",
    taskCardsMeta: "{done} revisados hoje",
    taskGap: "Fechar a lacuna",
    taskGapBody: "Capítulo {n}, {name}, com a menor cobertura: {pct}%.",
    taskGapMeta: "{seen} de {total} questões",
    taskStart: "Estudar",
    taskFix: "Estudar capítulo",
    heroStart: "Começar sessão",
    taskReview: "Revisar",
    taskOpen: "Abrir",
    taskExam: "Simulado cronometrado",
    taskExamBody:
      "Prova completa no formato oficial: {n} questões em {min} min, sorteio do pool exclusivo.",
    taskExamBodyCustom: "Monte uma prova sob medida: capítulos, níveis K, contagem e duração.",
    taskExamMeta: "último: {pct}% · {verdict}",
    taskExamMetaNone: "nenhum simulado ainda",
    taskExamStart: "Fazer simulado",
    last: "Última sessão",
    lastNone: "Nenhuma sessão neste dispositivo.",
    exam: "Data da prova",
    examNone: "Sem data marcada",
    examIn: "Em {n} dias",
    examToday: "É hoje",
    examPast: "A data já passou",
    examLabel: "Data da prova",
    examSave: "Salvar data",
    examClear: "Limpar",
    examNote: "A data fica neste dispositivo.",
    footnote: "Local-first · o progresso fica neste dispositivo",
    /* lembrete diário (porta do r10 do v3.18.0) */
    reminderTitle: "Lembrete diário",
    reminderDesc:
      "Um empurrãozinho na hora que você escolher. Notificações web não têm push de servidor — o app precisa estar aberto (em segundo plano conta).",
    reminderTimeLabel: "Horário",
    reminderOn: "Lembrete ativo todos os dias às {time}.",
    reminderOff: "Desligado.",
    reminderBlocked:
      "Notificações bloqueadas no navegador — ative nas permissões do site para receber o lembrete.",
    reminderBody: "Bora manter o ritmo? Meta de hoje: {n} questões.",
    goalAria: "Alterar meta diária de questões",
    goalLabel: "Meta:",
    goalUpdated: "Meta diária alterada para {n} questões",
  },
  cards: {
    kicker: "03 · Flashcards",
    title: "Lembrar é o começo.",
    lead: "Cartões gerados do banco da {code}: a pergunta na frente, a resposta e a explicação no verso. O que você erra volta antes.",
    due: "Vencidos hoje",
    queue: "Na fila",
    filter: "Filtrar por capítulo",
    all: "Todos",
    front: "Pergunta",
    back: "Resposta",
    flip: "Ver resposta",
    flipHint: "Espaço ou Enter",
    swipeHint: "Arraste para o lado · ← errei · lembrei →",
    rate: "Como foi lembrar?",
    again: "Errei",
    hard: "Quase",
    good: "Lembrei",
    againWhen: "volta na fila",
    hardWhen: "amanhã",
    goodWhen: "3 dias",
    counter: "Cartão {n} de {total}",
    doneTitle: "Fila concluída.",
    doneBody: "Você revisou {n} cartões nesta sessão.",
    doneNext: "Próxima revisão: {when}.",
    doneNone: "Nenhum cartão agendado.",
    doneAgain: "Revisar de novo",
    emptyTitle: "Nada vencido agora.",
    emptyBody:
      "Sua fila está em dia. Revisar tudo não altera o agendamento até você avaliar cada cartão.",
    reviewAll: "Revisar tudo",
    noBankTitle: "Esta prova ainda não tem cartões.",
    noBankBody:
      "Sem banco de questões, não há cartão para gerar. O baralho aparece quando o conteúdo chegar.",
    source: "Fonte",
    k: "K{k}",
    footnote: "Local-first · o agendamento fica neste dispositivo",
    dayOne: "amanhã",
    now: "agora",
    dayMany: "em {n} dias",
    undo: "Desfazer",
    undone: "Avaliação desfeita.",
  },
  syllabus: {
    kicker: "04 · Syllabus",
    title: "O que a prova cobra.",
    lead: "{code} {version} · {q} questões em {min} min · corte {pass}. O peso de cada capítulo vem do blueprint oficial.",
    search: "Buscar capítulo ou tópico",
    searchEmpty: "Nenhum capítulo corresponde a “{q}”.",
    colChapter: "Capítulo",
    colWeight: "Peso no exame",
    colBank: "Banco",
    colCoverage: "Cobertura",
    weightNote: "de {q} questões",
    sum: "Resumo do exame",
    totalWeight: "Soma dos capítulos",
    sourceNote: "Peso e corte seguem {rules}.",
    topics: "Tópicos do capítulo",
    emptyTitle: "Esta prova ainda não tem syllabus no app.",
    emptyBody:
      "O peso, os capítulos e os tópicos aparecem aqui quando o banco desta prova chegar. Nada foi inventado para preencher a tela.",
    footnote: "Fonte única · ISTQB {version}",
  },
  progress: {
    kicker: "05 · Progresso",
    title: "Onde você está.",
    lead: "Prontidão, cobertura, atividade e acerto — tudo lido do histórico deste dispositivo. Nada sai daqui.",
    coverage: "Cobertura",
    accuracy: "Acerto",
    accuracyNone: "Sem conferências",
    attempts: "{n} conferências",
    readiness: "Prontidão",
    readinessSub: "leitura principal",
    readinessCut: "corte {pct}%",
    readinessAbove: "acima do corte de {pct}%",
    readinessBelow: "abaixo do corte de {pct}%",
    readinessNoCut: "sem corte definido",
    readinessNote:
      "Questões únicas que você acertaria hoje, ponderadas pelo peso de cada capítulo no exame. O que ainda não foi conferido conta como zero.",
    readinessEmpty: "Ainda sem base para medir. Responda algumas questões em Estudar.",
    readinessNone: "Sem base ainda",
    readinessBase: "Conferências: {n} · acertos: {correct}",
    activity: "Atividade",
    activityRange: "12 semanas · questões conferidas e cartões avaliados",
    activityEmpty: "Nenhuma atividade ainda. A primeira questão acende o dia de hoje.",
    activityToday: "Hoje: {n}",
    activityLess: "menos",
    activityMore: "mais",
    activityHint: "Clique num dia para ver o detalhe. Setas navegam; Home/End vão aos extremos.",
    activityDay: "{date} · ações: {n}",
    activityDetail: "{date} · conferências: {a} · cartões: {r}",
    activityFuture: "Dia futuro",
    activityNoDay: "sem atividade",
    reachTitle: "Alcance e precisão",
    reachSub: "Cobertura × acerto por capítulo",
    reach: "Alcance",
    precision: "Precisão",
    reachNote:
      "Alcance é a cobertura do banco. Precisão é o acerto nas conferências. Sem conferência, a precisão fica no centro.",
    reachA11y: "Radar de alcance e precisão por capítulo. Alcance: {reach}. Precisão: {precision}.",
    reachNone: "Ainda sem conferências: só o alcance aparece.",
    kTitle: "Desempenho por K-level",
    kSub: "K = cognição exigida (K1 lembrar · K2 entender · K3 aplicar · K4 analisar)",
    kCorrect: "{n} de {total}",
    kNone: "sem conferência",
    kPct: "{pct}%",
    srsTitle: "Revisão espaçada",
    srsSub: "Flashcards · agenda local",
    srsStarted: "cartões iniciados",
    srsDue: "na fila hoje",
    srsMature: "maduros (21+ dias)",
    srsRetention: "retenção",
    srsReviews: "Avaliações: {n} · retenção {pct}%",
    srsNone: "Nenhum cartão avaliado nesta prova ainda.",
    srsCta: "Estudar {n} cartões",
    srsCtaNone: "Abrir Flashcards",
    srsNote: "A retenção conta “quase” e “lembrei”; “errei” volta na fila.",
    feedbackTitle: "Encontrou um número errado?",
    feedbackBody:
      "O feedback abre uma issue pública no GitHub. Não envie dados pessoais nem resultado de prova.",
    feedbackCta: "Enviar feedback",
    chapters: "Cobertura por capítulo",
    chaptersNote: "Questões únicas sobre o banco de estudo",
    colCov: "Cob.",
    colAcc: "Acerto",
    accuracyTitle: "Acerto por capítulo",
    accuracyNote: "Só conta o que foi conferido neste dispositivo",
    history: "Histórico",
    historyNone: "Nenhuma sessão registrada ainda.",
    historyBody: "Conclua uma sessão em Estudar para começar o histórico.",
    weak: "Pontos de atenção",
    weakNone: "Nada abaixo do limite: cobertura 60% e acerto 65%.",
    weakRow: "{name}",
    weakMeta: "cobertura {cov}% · acerto {acc}%",
    weakMetaNoAcc: "cobertura {cov}% · sem conferências",
    sessionRow: "Capítulo {n} · {correct}/{total}",
    when: "hoje",
    whenYesterday: "ontem",
    whenDays: "há {n} dias",
    go: "Ir para Estudar",
    stripDays: "dias",
    stripLevel: "Nível",
    achievementsLabel: "conquistas",
    roadmapTitle: "Próximas conquistas",
    roadmapHint: "o quão perto você está de cada uma",
    roadmapAlmost: "quase!",
    roadmapPct: "{current}% de {target}%",
    roadmapCount: "{current}/{target}",
    examHistoryTitle: "Simulados recentes",
    examHistorySub: "últimos {n} · {code}",
    examRowCustom: "sob medida",
    examRowPoints: "{pts} pts",
    examPassed: "aprovado",
    examFailed: "reprovado",
    examNone: "Nenhum simulado concluído ainda. A prova oficial tem corte em {pass}.",
    howItWorks: "Entendendo suas métricas",
    metricsTitle: "Entendendo suas métricas",
    metricsReadinessTitle: "📊 Prontidão",
    metricsReadinessDesc:
      "Estimativa ponderada pelo blueprint oficial e pelo último resultado de cada questão. O app exige cobertura mínima de 40% em cada capítulo e amostragem dos K-levels antes de indicar prontidão; incerteza e cobertura ficam nos detalhes.",
    metricsPerformanceTitle: "📈 Aproveitamento",
    metricsPerformanceDesc:
      "Percentual de acertos sobre TODAS as tentativas, incluindo re-respostas. Diferente da prontidão, que só conta o último status de cada questão única. Ambas as métricas são válidas — medem coisas diferentes.",
    metricsStreakTitle: "🔥 Sequência",
    metricsStreakDesc:
      "Dias consecutivos com estudo registrado no app. Consistência significa prática real, não apenas abrir o aplicativo.",
    metricsLevelTitle: "⭐ Nível",
    metricsLevelDesc:
      "Baseado em questões únicas que você acertou (não total de tentativas). Você sobe de nível a cada 20 acertos únicos — responder a mesma questão fácil 100 vezes não sobe seu nível.",
    backupTitle: "Dados e Backup",
    backupNote: "Exportação e importação local dos seus dados, sem cadastro.",
    exportJson: "Exportar backup (JSON)",
    importJson: "Importar backup (JSON)",
    exportCsv: "Baixar histórico (CSV)",
    resetBtn: "Limpar progresso",
    resetConfirm:
      "Deseja realmente limpar todo o progresso de {code}? Esta ação não pode ser desfeita.",
    resetSuccess: "Progresso resetado com sucesso.",
    importSuccess: "Backup importado com sucesso.",
    importError: "Arquivo de backup inválido.",
    footnote: "Local-first · o progresso fica neste dispositivo",
  },

  simulado: {
    kicker: "03 · Simulado",
    title: "Treine como no dia da prova.",
    lead: "Prova cronometrada no formato oficial da {code}: {n} questões em {min} minutos, sorteadas do pool exclusivo de simulado. O corte é {pass}.",
    leadPts:
      "Prova cronometrada no formato oficial da {code}: {n} questões em {min} minutos, valendo {points} pontos. O corte é {pass} pontos.",
    leadNoBank: "Esta prova ainda não tem banco de simulado.",
    poolNote: "pool exclusivo de simulado",
    poolCount: "{n} questões",
    official: "Prova oficial",
    officialDesc: "{n} questões · {min} min · corte {pass}",
    custom: "Personalizado",
    customDesc: "Escolha capítulos, níveis, tamanho e duração — a nota de corte escala junto.",
    customChapters: "Capítulos",
    customAllChapters: "Todos",
    customKLevels: "Níveis cognitivos",
    customAnyK: "Qualquer K",
    customCount: "Questões",
    customMinutes: "Duração (min)",
    customPool: "{n} no pool selecionado",
    customPassNote: "corte escalado: {n}/{total}",
    customPassNotePts: "corte oficial ≈ {pct}%",
    customEmpty: "Nenhuma questão do pool exclusivo atende esses filtros.",
    customTag: "Simulado personalizado",
    explain:
      "{n} questões em {min} minutos. Você pode navegar, marcar para revisão e trocar respostas até finalizar. O resultado entra no histórico e as erradas ficam disponíveis para treinar.",
    explainPts:
      "{n} questões em {min} minutos, pontuação ponderada por K-level (K2=1 · K3=2 · K4=3). Você pode navegar, marcar para revisão e trocar respostas até finalizar.",
    lastWrong: "Repetir erros do último simulado",
    lastWrongDesc: "{n} erradas para treinar",
    draftBanner: "Você tem um simulado em andamento",
    draftInfo: "{answered} de {total} respondidas · {time} restando",
    draftResume: "Retomar",
    draftDiscard: "Descartar",
    start: "Começar simulado",
    questionOf: "Questão {n} de {total}",
    timerLabel: "Tempo restante",
    showGrid: "Ver grade",
    hideGrid: "Fechar grade",
    gridSummary: "{answered} respondidas · {blank} em branco",
    flagOff: "Marcar",
    flagOn: "Marcada",
    flagAria: "Marcar questão para revisão",
    kbdHintLabel: "Atalhos do teclado",
    kbdAnswer: "responde",
    kbdNavigate: "navega",
    kbdFlag: "marca",
    kbdGrid: "grade",
    prev: "Anterior",
    next: "Próxima",
    finishExam: "Finalizar simulado",
    seeResult: "Ver resultado",
    backShort: "Sair",
    timeSummary: "⏱ {total} no total · ~{avg}s por questão respondida",
    passed: "Aprovado",
    failed: "Reprovado",
    excellentMsg: "Resultado excelente — ritmo de prova confirmado.",
    passedMsg: "Acima do corte. Mantenha o ritmo até o dia da prova.",
    failedMsg: "Abaixo do corte ({passMark}). Revise as erradas e tente de novo.",
    deltaVs: "vs simulado anterior",
    deltaUp: "+{n}%",
    deltaDown: "{n}%",
    deltaFlat: "0%",
    weakestChapter: "Ponto fraco desta prova: {chapter} ({pct}%).",
    studyChapter: "Estudar {chapter}",
    backHome: "Voltar",
    retakeQuiz: "Novo simulado",
    showReview: "Revisar prova",
    hideReview: "Esconder revisão",
    reviewTitle: "Revisão da prova",
    reviewBack: "voltar ao resultado",
    reviewFilterAria: "Filtros da revisão",
    reviewFilterWrong: "Erradas",
    reviewFilterBlank: "Em branco",
    reviewFilterFlagged: "Marcadas ⚑",
    reviewFilterCorrect: "Certas",
    reviewFilterAll: "Todas",
    reviewNoItems: "Nenhuma questão neste filtro.",
    yourAnswer: "sua resposta:",
    correctAnswer: "resposta correta:",
    notAnswered: "em branco",
    timeOnQuestion: "Tempo na questão",
    copyResult: "Copiar resultado",
    copied: "Copiado",
    copyResultText: "Synapse · {cert}: {score}/{total} ({pct}%) — {verdict} · corte {passMark}",
    trainWrong: "Treinar as {n} erradas",
    practiceTitle: "Treino das erradas",
    practiceBack: "Sair do treino",
    practiceNext: "Próxima",
    statusCurrent: "atual",
    statusAnswered: "respondida",
    statusBlank: "em branco",
    statusFlagged: "marcada",
    gridItemAria: "Questão {n}: {status}",
    footnote: "Local-first · o rascunho sobrevive à troca de aba",
  },

  splash: {
    skip: "Pular",
    ready: "Synapse pronto.",
  },

  onboarding: {
    badge: "Baseado nos syllabus oficiais do ISTQB",
    hero: "Tudo que você precisa para passar nas certificações ISTQB, de graça.",
    subtitle:
      "Questões PT/EN, flashcards com revisão espaçada e simulados oficiais — Foundation e Advanced Level.",
    statsQuestions: "700 questões",
    statCerts: "3 certificações",
    statLang: "PT/EN",
    statFree: "Gratuito",
    featuresTitle: "O que você vai encontrar",
    featStudyTitle: "Estudar — modo estudo",
    featStudyDesc: "Feedback e explicação a cada questão, contagem única e revisão espaçada.",
    featExamTitle: "Simulado cronometrado",
    featExamDesc:
      "Questões exclusivas que você nunca viu no estudo — blueprint, tempo e nota de corte oficiais.",
    featSrsTitle: "Flashcards com revisão espaçada",
    featSrsDesc: "Errei, quase, lembrei — o erro volta na hora certa e o acerto ganha intervalo.",
    featGlossaryTitle: "Glossário oficial ISTQB",
    featGlossaryDesc: "Termos oficiais em PT/EN, escopados por certificação.",
    featProgressTitle: "Progresso detalhado",
    featProgressDesc: "Prontidão por blueprint, cobertura, K-level, heatmap e data da prova.",
    featBilingualTitle: "Bilíngue",
    featBilingualDesc: "Alterne PT/EN a qualquer momento — o app inteiro acompanha.",
    demoTitle: "Veja como funciona",
    demoHint: "Exemplo de questão (CTFL) — clique numa alternativa:",
    demoDomain: "Fundamentos",
    demoQuestion: "Qual é a relação correta entre erro, defeito e falha?",
    demoOptA: "São sinônimos",
    demoOptB: "Erro gera defeito, que gera falha",
    demoOptC: "Falha gera erro",
    demoExp:
      "Um erro (ação humana) introduz um defeito no código, que pode causar uma falha (comportamento incorreto observável) durante a execução.",
    faqTitle: "Perguntas frequentes",
    faqQ1: "Preciso me cadastrar?",
    faqA1: "Não, nunca. Tudo funciona sem login e o progresso fica no seu dispositivo.",
    faqQ2: "É realmente gratuito?",
    faqA2: "Sim — sem anúncio, sem plano pago, sem pegadinha.",
    faqQ3: "O conteúdo é oficial do ISTQB?",
    faqA3:
      "Baseado nos syllabus públicos oficiais do ISTQB (CTFL, CTAL-TA e CTAL-TM hoje, outros a caminho) — o app não é afiliado ao ISTQB.",
    faqQ4: "Funciona no celular?",
    faqA4: "Sim, é instalável como app (PWA) e funciona offline.",
    faqQ5: "Posso usar em inglês?",
    faqA5: "Sim, alterne PT/EN a qualquer momento no topo do app.",
    finalTitle: "Sua trilha começa agora",
    cta: "Começar",
    back: "Voltar",
    closeAria: "Fechar",
    titleAria: "Como funciona o Synapse",
    disclaimer: "Synapse não é afiliado ao ISTQB · conteúdo baseado nos syllabus públicos",
  },

  install: {
    ariaLabel: "Instalar aplicativo",
    title: "Instalar o Synapse",
    hint: "Funciona offline, abre em tela cheia",
    cta: "Instalar",
    dismissAria: "Dispensar sugestão de instalação",
  },

  update: {
    title: "Nova versão disponível",
    hint: "Recarregue para atualizar — seu progresso fica salvo",
    cta: "Atualizar",
    dismissAria: "Dispensar aviso de atualização",
  },
};

const en: Strings = {
  nav: {
    label: "Main navigation",
    hoje: "Today",
    estudar: "Study",
    simulado: "Exam",
    flashcards: "Flashcards",
    syllabus: "Syllabus",
    progresso: "Progress",
    soon: "soon",
    more: "More",
    glossary: "Glossary",
    about: "About",
    certs: "Certifications",
    feedback: "Send feedback",
    secondary: "Support and context",
  },
  cert: {
    label: "Certification",
    change: "Switch exam",
    choose: "Choose certification",
    live: "available",
    soon: "coming soon",
    legacy: "legacy",
    current: "active exam",
  },
  tools: {
    lang: "Interface language",
    theme: "Toggle theme",
    light: "Light theme",
    dark: "Dark theme",
  },
  skip: "Skip to content",
  study: {
    kicker: "02 · Study",
    nav: "Study",
    title: "Your plan to exam day.",
    lead: "The {code} has {q} questions in {min} minutes. The pass mark is {pass}. The plan below follows each chapter’s official weight.",
    leadPoints:
      "The {code} has {q} questions in {min} minutes, worth {points} points. The pass mark is {pass} points.",
    next: "Next session",
    chapter: "Chapter {n}",
    examShare: "{n} of {q} exam questions",
    action: "Start studying",
    resume: "Resume studying",
    chapters: "Chapters",
    chaptersSub: "Study bank coverage",
    chaptersMeta: "{n} chapters · study bank coverage",
    examQ: "{n} on the exam",
    topics: "{n} key topics",
    studyChapter: "Study this chapter",
    chSeen: "{seen} of {total} questions seen",
    exam: "Your exam",
    questions: "Questions",
    time: "Time",
    cut: "Pass mark",
    chaptersCount: "Chapters",
    version: "Version",
    status: "Status",
    last: "Last session",
    source: "Source",
    coverage: "Coverage",
    coverageOf: "{seen} of {total} study questions",
    coveragePct: "{pct}%",
    emptyTitle: "No content for this certification yet.",
    emptyBody:
      "There are no questions for this certification on this device yet. The plan appears here as soon as the content arrives.",
    emptyAction: "Back to CTFL",
    emptyAside: "No study bank yet",
    footnote: "Local-first · progress stays on this device",
    savedTitle: "Saved questions",
    savedDesc: "{n} question(s) marked for review",
    savedNote: "Review the questions you bookmarked with a star during study.",
    studySaved: "Study saved",
    noSaved: "No saved questions yet",
  },
  session: {
    exit: "Back to plan",
    progress: "Question {n} of {total}",
    check: "Check answer",
    next: "Next question",
    finish: "See result",
    correct: "Correct answer",
    wrong: "Not quite",
    rightIs: "The correct answer is {letter}.",
    back: "Back to plan",
    done: "Session complete.",
    score: "{n} of {total} correct",
    scoreOf: "/ {total} correct",
    result: "Result",
    coverageNow: "Chapter {ch} coverage is now {pct}%.",
    otherChapter: "Study another chapter",
    source: "Source",
    needPick: "Choose an option to check.",
    saved: "Progress saved on this device.",
    save: "Save question",
    unsave: "Remove from saved",
    saveBadge: "Save",
    savedBadge: "Saved",
    chapterLabel: "Chapter {n} · {name}",
    answer: "Answer {letter}",
    k: "K{k}",
    tagCorrect: "correct",
    tagYours: "your answer",
  },
  a11y: {
    answer: "Options",
    feedback: "Result",
    plan: "Study plan",
    topics: "Chapter topics",
    coverage: "Study bank coverage",
  },
  today: {
    kicker: "01 · Today",
    title: "What pays off today.",
    lead: "{n} chapters left to close {code}. Three short fronts beat one long session.",
    leadOne: "One chapter left to close {code}. Three short fronts beat one long session.",
    leadDone: "You have covered every {code} chapter. Today is review and checking.",
    streak: "Streak",
    streakUnit: "days",
    streakNone: "Start today",
    check: "Check in today",
    checked: "Today is marked",
    unchecked: "Check-in removed",
    checkNote: "Counts by itself when you study. No button, no account.",
    todayCount: "Today: {n} actions",
    todayNone: "Today does not count yet.",
    readiness: "Readiness",
    readinessSub: "blueprint weight",
    readinessAbove: "above the {pct}% pass mark",
    readinessBelow: "below the {pct}% pass mark",
    readinessNoCut: "no pass mark set",
    readinessEmpty: "No baseline yet. Answer a few questions to measure.",
    readinessNone: "No baseline yet",
    readinessCut: "{pct}% pass mark",
    readinessBase: "Checks: {n} · correct: {correct}",
    readinessSee: "See in Progress",
    week: "Last 7 days",
    weekUnit: "questions checked",
    weekEmpty: "No checks in the last 7 days.",
    tasks: "Your day",
    tasksNote: "Suggestions from your progress",
    taskStudy: "Study session",
    taskStudyBody: "Six questions from chapter {n}, {name}.",
    taskStudyMeta: "{done} of {goal} today",
    taskCards: "Card review",
    taskCardsBody: "{n} cards in today’s queue.",
    taskCardsNone: "No cards due. Reviewing anyway keeps the habit.",
    taskCardsMeta: "{done} reviewed today",
    taskGap: "Close the gap",
    taskGapBody: "Chapter {n}, {name}, has the lowest coverage: {pct}%.",
    taskGapMeta: "{seen} of {total} questions",
    taskStart: "Study",
    taskFix: "Study chapter",
    heroStart: "Start session",
    taskReview: "Review",
    taskOpen: "Open",
    taskExam: "Timed exam simulation",
    taskExamBody:
      "Full mock exam in the official format: {n} questions in {min} min, drawn from the exclusive exam pool.",
    taskExamBodyCustom: "Build a custom exam: chapters, K-levels, size and duration.",
    taskExamMeta: "last: {pct}% · {verdict}",
    taskExamMetaNone: "no exam yet",
    taskExamStart: "Take an exam",
    last: "Last session",
    lastNone: "No session on this device yet.",
    exam: "Exam date",
    examNone: "No date set",
    examIn: "In {n} days",
    examToday: "Today",
    examPast: "The date has passed",
    examLabel: "Exam date",
    examSave: "Save date",
    examClear: "Clear",
    examNote: "The date stays on this device.",
    footnote: "Local-first · progress stays on this device",
    /* daily reminder (port of v3.18.0 r10) */
    reminderTitle: "Daily reminder",
    reminderDesc:
      "A nudge at the time you choose. Web notifications have no server push — the app must stay open (background counts).",
    reminderTimeLabel: "Time",
    reminderOn: "Reminder active every day at {time}.",
    reminderOff: "Off.",
    reminderBlocked:
      "Notifications blocked in the browser — enable them in the site permissions to get the reminder.",
    reminderBody: "Let’s keep the pace? Today’s goal: {n} questions.",
    goalAria: "Change daily question goal",
    goalLabel: "Goal:",
    goalUpdated: "Daily goal changed to {n} questions",
  },
  cards: {
    kicker: "03 · Flashcards",
    title: "Remembering comes first.",
    lead: "Cards generated from the {code} bank: question on the front, answer and explanation on the back. What you miss comes back sooner.",
    due: "Due today",
    queue: "In the queue",
    filter: "Filter by chapter",
    all: "All",
    front: "Question",
    back: "Answer",
    flip: "Show answer",
    flipHint: "Space or Enter",
    swipeHint: "Swipe sideways · ← missed · remembered →",
    rate: "How did recall feel?",
    again: "Missed",
    hard: "Almost",
    good: "Remembered",
    againWhen: "back in the queue",
    hardWhen: "tomorrow",
    goodWhen: "3 days",
    counter: "Card {n} of {total}",
    doneTitle: "Queue cleared.",
    doneBody: "You reviewed {n} cards this session.",
    doneNext: "Next review: {when}.",
    doneNone: "No cards scheduled.",
    doneAgain: "Review again",
    emptyTitle: "Nothing due right now.",
    emptyBody:
      "Your queue is clear. Reviewing everything does not change the schedule until you rate each card.",
    reviewAll: "Review everything",
    noBankTitle: "No cards for this certification yet.",
    noBankBody:
      "Without a question bank there is no card to build. The deck appears when the content arrives.",
    source: "Source",
    k: "K{k}",
    footnote: "Local-first · scheduling stays on this device",
    dayOne: "tomorrow",
    now: "now",
    dayMany: "in {n} days",
    undo: "Undo",
    undone: "Rating undone.",
  },
  syllabus: {
    kicker: "04 · Syllabus",
    title: "What the exam covers.",
    lead: "{code} {version} · {q} questions in {min} min · pass mark {pass}. Each chapter weight comes from the official blueprint.",
    search: "Search chapter or topic",
    searchEmpty: "No chapter matches “{q}”.",
    colChapter: "Chapter",
    colWeight: "Exam weight",
    colBank: "Bank",
    colCoverage: "Coverage",
    weightNote: "of {q} questions",
    sum: "Exam summary",
    totalWeight: "Chapter total",
    sourceNote: "Weight and pass mark follow {rules}.",
    topics: "Chapter topics",
    emptyTitle: "This certification has no syllabus in the app yet.",
    emptyBody:
      "Weight, chapters and topics appear here when the bank arrives. Nothing was invented to fill the screen.",
    footnote: "Single source · ISTQB {version}",
  },
  progress: {
    kicker: "05 · Progress",
    title: "Where you stand.",
    lead: "Readiness, coverage, activity and accuracy — all read from this device’s history. Nothing leaves it.",
    coverage: "Coverage",
    accuracy: "Accuracy",
    accuracyNone: "No checks yet",
    attempts: "{n} checks",
    readiness: "Readiness",
    readinessSub: "primary reading",
    readinessCut: "{pct}% pass mark",
    readinessAbove: "above the {pct}% pass mark",
    readinessBelow: "below the {pct}% pass mark",
    readinessNoCut: "no pass mark set",
    readinessNote:
      "Unique questions you would answer correctly today, weighted by each chapter’s exam weight. What you have not checked yet counts as zero.",
    readinessEmpty: "No baseline to measure yet. Answer a few questions in Study.",
    readinessNone: "No baseline yet",
    readinessBase: "Checks: {n} · correct: {correct}",
    activity: "Activity",
    activityRange: "12 weeks · questions checked and cards rated",
    activityEmpty: "No activity yet. The first question lights up today.",
    activityToday: "Today: {n}",
    activityLess: "less",
    activityMore: "more",
    activityHint: "Select a day to see the detail. Arrows navigate; Home/End jump to the edges.",
    activityDay: "{date} · actions: {n}",
    activityDetail: "{date} · checks: {a} · cards: {r}",
    activityFuture: "Future day",
    activityNoDay: "no activity",
    reachTitle: "Reach and precision",
    reachSub: "Coverage × accuracy by chapter",
    reach: "Reach",
    precision: "Precision",
    reachNote:
      "Reach is bank coverage. Precision is accuracy in checks. With no checks, precision stays at the centre.",
    reachA11y: "Reach and precision radar by chapter. Reach: {reach}. Precision: {precision}.",
    reachNone: "No checks yet: only reach appears.",
    kTitle: "Performance by K-level",
    kSub: "K = required cognition (K1 remember · K2 understand · K3 apply · K4 analyse)",
    kCorrect: "{n} of {total}",
    kNone: "no checks",
    kPct: "{pct}%",
    srsTitle: "Spaced repetition",
    srsSub: "Flashcards · local schedule",
    srsStarted: "cards started",
    srsDue: "in today’s queue",
    srsMature: "mature (21+ days)",
    srsRetention: "retention",
    srsReviews: "Ratings: {n} · retention {pct}%",
    srsNone: "No card rated for this exam yet.",
    srsCta: "Study {n} cards",
    srsCtaNone: "Open Flashcards",
    srsNote: "Retention counts “almost” and “remembered”; “missed” returns to the queue.",
    feedbackTitle: "Found a wrong number?",
    feedbackBody:
      "Feedback opens a public GitHub issue. Do not send personal data or exam results.",
    feedbackCta: "Send feedback",
    chapters: "Coverage by chapter",
    chaptersNote: "Unique questions over the study bank",
    colCov: "Cov.",
    colAcc: "Acc.",
    accuracyTitle: "Accuracy by chapter",
    accuracyNote: "Only what was checked on this device",
    history: "History",
    historyNone: "No session recorded yet.",
    historyBody: "Finish a session in Study to start the history.",
    weak: "Attention points",
    weakNone: "Nothing below the line: 60% coverage and 65% accuracy.",
    weakRow: "{name}",
    weakMeta: "coverage {cov}% · accuracy {acc}%",
    weakMetaNoAcc: "coverage {cov}% · no checks",
    sessionRow: "Chapter {n} · {correct}/{total}",
    when: "today",
    whenYesterday: "yesterday",
    whenDays: "{n} days ago",
    go: "Go to Study",
    stripDays: "days",
    stripLevel: "Level",
    achievementsLabel: "achievements",
    roadmapTitle: "Next achievements",
    roadmapHint: "how close you are to each one",
    roadmapAlmost: "almost!",
    roadmapPct: "{current}% of {target}%",
    roadmapCount: "{current}/{target}",
    examHistoryTitle: "Recent exams",
    examHistorySub: "last {n} · {code}",
    examRowCustom: "custom",
    examRowPoints: "{pts} pts",
    examPassed: "passed",
    examFailed: "failed",
    examNone: "No exam completed yet. The official pass mark is {pass}.",
    howItWorks: "Understanding your metrics",
    metricsTitle: "Understanding your metrics",
    metricsReadinessTitle: "📊 Readiness",
    metricsReadinessDesc:
      "A weighted estimate based on the official blueprint and the latest result of each question. The app requires minimum coverage of 40% per chapter and K-level sampling before indicating readiness; uncertainty and coverage live in the details.",
    metricsPerformanceTitle: "📈 Performance",
    metricsPerformanceDesc:
      "Percentage of correct answers over ALL attempts, including re-answers. Unlike readiness, which only counts the latest status of each unique question. Both metrics are valid — they measure different things.",
    metricsStreakTitle: "🔥 Streak",
    metricsStreakDesc:
      "Consecutive days with study recorded in the app. Consistency means real practice, not just opening the app.",
    metricsLevelTitle: "⭐ Level",
    metricsLevelDesc:
      "Based on unique questions you answered correctly (not total attempts). You level up every 20 unique correct answers — answering the same easy question 100 times does not raise your level.",
    backupTitle: "Data & Backup",
    backupNote: "Local export and import of your data, no account required.",
    exportJson: "Export backup (JSON)",
    importJson: "Import backup (JSON)",
    exportCsv: "Download history (CSV)",
    resetBtn: "Reset progress",
    resetConfirm: "Are you sure you want to reset all progress for {code}? This cannot be undone.",
    resetSuccess: "Progress reset successfully.",
    importSuccess: "Backup imported successfully.",
    importError: "Invalid backup file.",
    footnote: "Local-first · progress stays on this device",
  },

  simulado: {
    kicker: "03 · Exam",
    title: "Train like exam day.",
    lead: "Timed mock exam in the official {code} format: {n} questions in {min} minutes, drawn from the exclusive exam pool. Pass mark is {pass}.",
    leadPts:
      "Timed mock exam in the official {code} format: {n} questions in {min} minutes, worth {points} points. Pass mark is {pass} points.",
    leadNoBank: "This certification has no exam bank yet.",
    poolNote: "exclusive exam pool",
    poolCount: "{n} questions",
    official: "Official exam",
    officialDesc: "{n} questions · {min} min · pass {pass}",
    custom: "Custom",
    customDesc: "Pick chapters, K-levels, size and duration — the pass mark scales along.",
    customChapters: "Chapters",
    customAllChapters: "All",
    customKLevels: "Cognitive levels",
    customAnyK: "Any K",
    customCount: "Questions",
    customMinutes: "Duration (min)",
    customPool: "{n} in the selected pool",
    customPassNote: "scaled pass mark: {n}/{total}",
    customPassNotePts: "official cut ≈ {pct}%",
    customEmpty: "No question in the exclusive pool matches these filters.",
    customTag: "Custom exam",
    explain:
      "{n} questions in {min} minutes. You can navigate, flag for review and change answers until you finish. The result goes into history and the wrong ones become trainable.",
    explainPts:
      "{n} questions in {min} minutes, K-level weighted scoring (K2=1 · K3=2 · K4=3). You can navigate, flag for review and change answers until you finish.",
    lastWrong: "Redo last exam's mistakes",
    lastWrongDesc: "{n} wrong ones to train",
    draftBanner: "You have an exam in progress",
    draftInfo: "{answered} of {total} answered · {time} left",
    draftResume: "Resume",
    draftDiscard: "Discard",
    start: "Start exam",
    questionOf: "Question {n} of {total}",
    timerLabel: "Time left",
    showGrid: "Show grid",
    hideGrid: "Close grid",
    gridSummary: "{answered} answered · {blank} blank",
    flagOff: "Flag",
    flagOn: "Flagged",
    flagAria: "Flag question for review",
    kbdHintLabel: "Keyboard shortcuts",
    kbdAnswer: "answer",
    kbdNavigate: "navigate",
    kbdFlag: "flag",
    kbdGrid: "grid",
    prev: "Previous",
    next: "Next",
    finishExam: "Finish exam",
    seeResult: "See result",
    backShort: "Exit",
    timeSummary: "⏱ {total} total · ~{avg}s per answered question",
    passed: "Passed",
    failed: "Failed",
    excellentMsg: "Excellent result — exam pace confirmed.",
    passedMsg: "Above the pass mark. Keep the pace until exam day.",
    failedMsg: "Below the pass mark ({passMark}). Review the wrong ones and try again.",
    deltaVs: "vs previous exam",
    deltaUp: "+{n}%",
    deltaDown: "{n}%",
    deltaFlat: "0%",
    weakestChapter: "Weak spot in this exam: {chapter} ({pct}%).",
    studyChapter: "Study {chapter}",
    backHome: "Back",
    retakeQuiz: "New exam",
    showReview: "Review exam",
    hideReview: "Hide review",
    reviewTitle: "Exam review",
    reviewBack: "back to result",
    reviewFilterAria: "Review filters",
    reviewFilterWrong: "Wrong",
    reviewFilterBlank: "Blank",
    reviewFilterFlagged: "Flagged ⚑",
    reviewFilterCorrect: "Correct",
    reviewFilterAll: "All",
    reviewNoItems: "No question in this filter.",
    yourAnswer: "your answer:",
    correctAnswer: "correct answer:",
    notAnswered: "blank",
    timeOnQuestion: "Time on question",
    copyResult: "Copy result",
    copied: "Copied",
    copyResultText: "Synapse · {cert}: {score}/{total} ({pct}%) — {verdict} · pass mark {passMark}",
    trainWrong: "Train the {n} wrong ones",
    practiceTitle: "Wrong-answer training",
    practiceBack: "Exit training",
    practiceNext: "Next",
    statusCurrent: "current",
    statusAnswered: "answered",
    statusBlank: "blank",
    statusFlagged: "flagged",
    gridItemAria: "Question {n}: {status}",
    footnote: "Local-first · the draft survives tab switches",
  },

  splash: {
    skip: "Skip",
    ready: "Synapse ready.",
  },

  onboarding: {
    badge: "Based on the official ISTQB syllabi",
    hero: "Everything you need to pass ISTQB certifications, for free.",
    subtitle:
      "PT/EN questions, spaced-repetition flashcards and official exam simulations — Foundation and Advanced Level.",
    statsQuestions: "700 questions",
    statCerts: "3 certifications",
    statLang: "PT/EN",
    statFree: "Free",
    featuresTitle: "What you’ll find",
    featStudyTitle: "Study mode",
    featStudyDesc:
      "Feedback and explanation for every question, unique counting and spaced repetition.",
    featExamTitle: "Timed exam simulation",
    featExamDesc:
      "Exclusive questions you have never seen in study mode — official blueprint, timing and pass mark.",
    featSrsTitle: "Flashcards with spaced repetition",
    featSrsDesc:
      "Missed, almost, remembered — a miss returns at the right time and a hit earns an interval.",
    featGlossaryTitle: "Official ISTQB glossary",
    featGlossaryDesc: "Official terms in PT/EN, scoped per certification.",
    featProgressTitle: "Detailed progress",
    featProgressDesc: "Blueprint readiness, coverage, K-levels, heatmap and exam date.",
    featBilingualTitle: "Bilingual",
    featBilingualDesc: "Switch PT/EN at any moment — the whole app follows.",
    demoTitle: "See how it works",
    demoHint: "Sample question (CTFL) — click an option:",
    demoDomain: "Fundamentals",
    demoQuestion: "What is the correct relationship between error, defect and failure?",
    demoOptA: "They are synonyms",
    demoOptB: "An error causes a defect, which causes a failure",
    demoOptC: "A failure causes an error",
    demoExp:
      "An error (a human action) introduces a defect into the code, which may cause a failure (observable incorrect behaviour) during execution.",
    faqTitle: "Frequently asked questions",
    faqQ1: "Do I need an account?",
    faqA1: "No, never. Everything works without login and progress stays on your device.",
    faqQ2: "Is it really free?",
    faqA2: "Yes — no ads, no paid plan, no catch.",
    faqQ3: "Is the content official ISTQB?",
    faqA3:
      "Based on the official public ISTQB syllabi (CTFL, CTAL-TA and CTAL-TM today, more on the way) — the app is not affiliated with ISTQB.",
    faqQ4: "Does it work on mobile?",
    faqA4: "Yes, it installs as an app (PWA) and works offline.",
    faqQ5: "Can I use it in English?",
    faqA5: "Yes, switch PT/EN anytime at the top of the app.",
    finalTitle: "Your trail starts now",
    cta: "Start",
    back: "Back",
    closeAria: "Close",
    titleAria: "How Synapse works",
    disclaimer: "Synapse is not affiliated with ISTQB · content based on the public syllabi",
  },

  install: {
    ariaLabel: "Install app",
    title: "Install Synapse",
    hint: "Works offline, opens full screen",
    cta: "Install",
    dismissAria: "Dismiss install suggestion",
  },

  update: {
    title: "New version available",
    hint: "Reload to update — your progress is saved",
    cta: "Update",
    dismissAria: "Dismiss update notice",
  },
};

export const STRINGS: Record<"pt" | "en", Strings> = { pt, en };
