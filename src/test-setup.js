import "@testing-library/jest-dom";
// r5: code-split do banco — componentes chamam getBank() sincronamente no
// render, mas o banco agora vive em chunks lazy (loadBankFor). Pré-carrega
// as fatias das certs LIVE uma vez por arquivo de teste, ANTES da avaliação
// do módulo de teste (top-level await: bank.test.js usa getBank no escopo
// do módulo, que roda depois deste setup).
import { loadBankFor } from "./lib/bank.js";

await Promise.all([loadBankFor("ctfl"), loadBankFor("ctal-ta"), loadBankFor("ctal-tm")]);
