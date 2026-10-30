import publicIds from "../data/axon-public-ids.json";

interface AxonQuestionLinkProps {
  questionId: string;
  lang: "pt" | "en";
}

export function AxonQuestionLink({ questionId, lang }: AxonQuestionLinkProps) {
  const publicId = publicIds[questionId as keyof typeof publicIds];
  if (!publicId) return null;

  return (
    <a
      className="axon-question-link"
      href={`https://noos.study/${lang}/q/${publicId}/`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>{lang === "pt" ? "Ver no Noos" : "View on Noos"}</span>
      <code>{publicId}</code>
      <span aria-hidden="true">↗</span>
    </a>
  );
}
