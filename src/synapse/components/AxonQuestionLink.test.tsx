import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AxonQuestionLink } from "./AxonQuestionLink";

afterEach(cleanup);

describe("AxonQuestionLink", () => {
  it.each([
    ["pt", "Ver no Noos"],
    ["en", "View on Noos"],
  ] as const)("links study questions in %s", (lang, label) => {
    render(<AxonQuestionLink questionId="ch1-40" lang={lang} />);
    const link = screen.getByRole("link", { name: new RegExp(label) });
    expect(link.getAttribute("href")).toBe(`https://noos.study/${lang}/q/SYN-CTFL-00032/`);
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("does not expose exclusive exam questions", () => {
    const { container } = render(<AxonQuestionLink questionId="ch1-02" lang="pt" />);
    expect(container.querySelector("a")).toBeNull();
  });
});
