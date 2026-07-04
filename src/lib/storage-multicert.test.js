import { describe, it, expect, beforeEach } from "vitest";
import {
  recordAnswer, loadProgress, saveProgress, clearProgress,
  toggleSaved, setActiveCertForStorage,
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
    const legacy = { total: 5, correct: 4, byDomain: { "1": { t: 5, c: 4 } }, seen: {}, saved: [], history: [], srs: {}, lastStudyDate: null };
    localStorage.setItem("ctfl_progress_v1", JSON.stringify(legacy));

    const migrated = loadProgress("ctfl");
    expect(migrated.total).toBe(5);
    expect(migrated.correct).toBe(4);

    // other certs remain untouched by the migration
    const ctal = loadProgress("ctal-ta");
    expect(ctal.total).toBe(0);
  });
});
