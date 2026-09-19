export const cleanPrompt = (prompt, options = {}) => {
  if (!prompt || typeof prompt !== "string") {
    return "";
  }

  const {
    maxLength = 500,
    removeSensitiveInfo = true,
    removeUnsafeContent = true,
    removeAdultContent = true,
  } = options;

  const adultWords = [
    "porn",
    "porno",
    "pornography",
    "xxx",
    "sex",
    "nude",
    "nudity",
    "naked",
    "erotic",
    "adult",
    "nsfw",
  ];

  const sensitiveTerms = [
    "india",
    "china",
    "russia",
    "usa",
    "united states",
    "pakistan",
    "iran",
    "north korea",

    "government",
    "military",
    "army",
    "navy",
    "air force",
    "defense",
    "missile",
    "weapon",
    "nuclear",

    "cia",
    "fbi",
    "raw",
    "mossad",
    "mi6",
    "nsa",
  ];

  let clean = prompt.trim();

  clean = clean.replace(/\s+/g, " ");
  clean = clean.slice(0, maxLength);

  if (removeSensitiveInfo) {
    clean = clean.replace(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      "[EMAIL]",
    );
    clean = clean.replace(/\b\d{10,15}\b/g, "");
    clean = clean.replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, "");
    clean = clean.replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, "");
    clean = clean.replace(/\b(?:\d[ -]*?){13,16}\b/g, "");
    clean = clean.replace(/api[_-]?key\s*[:=]?\s*[a-z0-9\-_]+/gi, "");
    clean = clean.replace(/bearer\s+[a-z0-9\-_.]+/gi, "");
    clean = clean.replace(/password\s*[:=]?\s*\S+/gi, "");

    sensitiveTerms.forEach((term) => {
      const regex = new RegExp(`\\b${term}\\b`, "gi");
      clean = clean.replace(regex, "");
    });

    clean = clean.replace(/\s+/g, " ").replace(/\s+,/g, ",").trim();
  }

  if (removeUnsafeContent) {
    const blockedPatterns = [
      /ignore previous instructions/gi,
      /system prompt/gi,
      /developer message/gi,
      /jailbreak/gi,
      /bypass restrictions/gi,
      /pretend to be/gi,
      /act as/gi,
    ];

    blockedPatterns.forEach((pattern) => {
      clean = clean.replace(pattern, "[BLOCKED]");
    });
  }

  if (removeAdultContent) {
    adultWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      clean = clean.replace(regex, "");
    });

    clean = clean.replace(/\s+/g, " ").trim();
  }

  return clean.trim();
};