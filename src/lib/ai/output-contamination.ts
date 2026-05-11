export type OutputContaminationMatch = {
  path: string;
  term: string;
  excerpt: string;
};

export type OutputContaminationResult = {
  contaminated: boolean;
  matches: OutputContaminationMatch[];
  safeErrorSummary: string | null;
};

export function scanOutputContamination(
  value: unknown,
  bannedTerms: string[]
): OutputContaminationResult {
  const matches: OutputContaminationMatch[] = [];
  const terms = bannedTerms.map((term) => term.trim()).filter(Boolean);

  walkValue(value, "", terms, matches);

  return {
    contaminated: matches.length > 0,
    matches,
    safeErrorSummary:
      matches.length > 0
        ? `contaminated_output: ${matches
            .slice(0, 5)
            .map((match) => `path=${match.path} term=${match.term}`)
            .join("; ")}`
        : null
  };
}

function walkValue(
  value: unknown,
  path: string,
  bannedTerms: string[],
  matches: OutputContaminationMatch[]
) {
  if (typeof value === "string") {
    scanString(value, path || "$", bannedTerms, matches);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      walkValue(item, `${path}[${index}]`, bannedTerms, matches)
    );
    return;
  }

  if (typeof value === "object" && value !== null) {
    for (const [key, item] of Object.entries(value)) {
      walkValue(item, path ? `${path}.${key}` : key, bannedTerms, matches);
    }
  }
}

function scanString(
  value: string,
  path: string,
  bannedTerms: string[],
  matches: OutputContaminationMatch[]
) {
  const lowerValue = value.toLowerCase();

  for (const term of bannedTerms) {
    if (lowerValue.includes(term.toLowerCase())) {
      matches.push({
        path,
        term,
        excerpt: createExcerpt(value, term)
      });
    }
  }
}

function createExcerpt(value: string, term: string) {
  const index = value.toLowerCase().indexOf(term.toLowerCase());
  const start = Math.max(0, index - 16);
  const end = Math.min(value.length, index + term.length + 16);

  return value.slice(start, end);
}
