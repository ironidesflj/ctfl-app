// Catálogo de vitrine (UI) — separado de certs.config.js de propósito.
// certs.config.js só tem certs bank-ready (getBank() lê de lá e quebra se
// faltar `chapters`); aqui listamos TODAS as certs pra exibição, incluindo
// as que ainda não têm banco. NUNCA importar isto em bank.js.
//
// status: "live"        — navegável, tem banco (bate com VALID_CERTS/certs.config)
//         "coming-soon" — aparece desabilitado na lista ("em breve")
//         "legacy"      — CTFL-AT: existe adormecido no repo, sai de destaque,
//                         nota separada (não entra na lista coming-soon)
//
// `mark`/`fullName` dos live espelham certs.config.js (fonte da verdade dos
// dados de exame fica lá; aqui é só vitrine).

export const CERT_CATALOG = [
  { id: "ctfl",       status: "live",        mark: "CT", label: "CTFL",       fullName: "Foundation Level",      version: "v4.0" },
  { id: "ctal-ta",    status: "live",        mark: "TA", label: "CTAL-TA",    fullName: "Test Analyst",          version: "v4.0" },
  { id: "ctal-tm",    status: "coming-soon", mark: "TM", label: "CTAL-TM",    fullName: "Test Manager",          version: "v3.0" },
  { id: "ct-ai",      status: "coming-soon", mark: "AI", label: "CT-AI",      fullName: "AI Testing",            version: "v1.0" },
  { id: "ctal-at-v2", status: "coming-soon", mark: "AT", label: "CTAL-AT",    fullName: "Advanced Test Automation", version: "v2.0" },
  { id: "ctfl-at",    status: "legacy",      mark: "AG", label: "CTFL-AT",    fullName: "Agile Tester", version: "v1.0" },
];

// Lookup por id, pro masthead resolver o cert ativo da rota.
export const CATALOG_BY_ID = Object.fromEntries(CERT_CATALOG.map((c) => [c.id, c]));
