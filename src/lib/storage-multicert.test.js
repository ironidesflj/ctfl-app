import { describe, it, expect, beforeEach } from "vitest";
import {
  recordAnswer,
  loadProgress,
  saveProgress,
  clearProgress,
  toggleSaved,
  setActiveCertForStorage,
  saveExamDraft,
  loadExamDraft,
  clearExamDraft,
} from "./storage.js";

describe("storage - per-cert isolation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("answering/saving in ctfl does not leak into ctal-ta", () => {
    setActiveCertForStorage("ctfl");
    let ctfl = loadProgress("ctfl");
    ctfl = recordAnswer(ctfl, "1", true, "ctfl-q1");
    ctfl = toggleSaved(ctfl, "ctfl-q1");
    saveProgress(ctfl, "ctfl");

    const ctal = loadProgress("ctal-ta");
    expect(ctal.total).toBe(0);
    expect(ctal.saved).toEqual([]);
    expect(ctal.byDomain).toEqual({});
  });

  it("byDomain keyed by chapter number does not collide across certs", () => {
    let ctfl = loadProgress("ctfl");
    ctfl = recordAnswer(ctfl, "1", true, "ctfl-ch1");
    saveProgress(ctfl, "ctfl");

    let ctal = loadProgress("ctal-ta");
    ctal = recordAnswer(ctal, "1", false, "ctalta-ch1");
    saveProgress(ctal, "ctal-ta");

    expect(loadProgress("ctfl").byDomain["1"]).toEqual({ t: 1, c: 1 });
    expect(loadProgress("ctal-ta").byDomain["1"]).toEqual({ t: 1, c: 0 });
  });

  it("clearProgress only clears the given cert's key", () => {
    let ctfl = loadProgress("ctfl");
    ctfl = recordAnswer(ctfl, "1", true, "q1");
    saveProgress(ctfl, "ctfl");

    let ctal = loadProgress("ctal-ta");
    ctal = recordAnswer(ctal, "1", true, "q2");
    saveProgress(ctal, "ctal-ta");

    clearProgress("ctfl");

    expect(loadProgress("ctfl").total).toBe(0);
    expect(loadProgress("ctal-ta").total).toBe(1);
  });

  it("migrates legacy global key into the ctfl namespace once", () => {
    const legacy = {
      total: 5,
      correct: 4,
      byDomain: { 1: { t: 5, c: 4 } },
      seen: {},
      saved: [],
      history: [],
      srs: {},
      lastStudyDate: null,
    };
    localStorage.setItem("ctfl_progress_v1", JSON.stringify(legacy));

    const migrated = loadProgress("ctfl");
    expect(migrated.total).toBe(5);
    expect(migrated.correct).toBe(4);

    // other certs remain untouched by the migration
    const ctal = loadProgress("ctal-ta");
    expect(ctal.total).toBe(0);
  });
});

describe("storage - exam draft index epoch (r20)", () => {
  beforeEach(() => localStorage.clear());

  const draftKey = (cert) => `synapse.examDraft.v1.${cert}`;
  const draft = (epoch) => ({
    questionIds: ["ctaltm-101", "ctaltm-102"],
    optOrder: [
      [0, 1, 2, 3],
      [3, 2, 1, 0],
    ],
    answers: [1, null],
    flags: [false, false],
    durations: [12, 0],
    idx: 1,
    timeLeft: 3000,
    custom: false,
    savedAt: Date.now(),
    ...(typeof epoch === "number" ? { epoch } : {}),
  });

  it("carimba o epoch atual e retoma o rascunho", () => {
    saveExamDraft("ctal-tm", draft());
    expect(JSON.parse(localStorage.getItem(draftKey("ctal-tm"))).epoch).toBe(1);
    expect(loadExamDraft("ctal-tm").questionIds).toEqual(["ctaltm-101", "ctaltm-102"]);
    clearExamDraft("ctal-tm");
  });

  it("descarta e remove epoch incompatível", () => {
    localStorage.setItem(draftKey("ctal-tm"), JSON.stringify(draft(2)));
    expect(loadExamDraft("ctal-tm")).toBeNull();
    expect(localStorage.getItem(draftKey("ctal-tm"))).toBeNull();
  });

  it("mantém isolamento por certificação", () => {
    localStorage.setItem(draftKey("ctfl"), JSON.stringify(draft(1)));
    localStorage.setItem(draftKey("ctal-tm"), JSON.stringify(draft(2)));
    expect(loadExamDraft("ctfl")).not.toBeNull();
    expect(loadExamDraft("ctal-tm")).toBeNull();
  });

  it("aceita rascunho legado sem epoch sob epoch 1", () => {
    localStorage.setItem(draftKey("ctfl"), JSON.stringify(draft()));
    expect(loadExamDraft("ctfl")).not.toBeNull();
    clearExamDraft("ctfl");
  });
});
