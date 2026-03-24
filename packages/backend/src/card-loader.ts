import { readFileSync } from "fs";
import { join } from "path";
import type { CardBilingual } from "@esd/shared";

export function loadCards(
  csvPath: string = join(import.meta.dir, "data", "EinSolchesDing_de_en.csv")
): CardBilingual[] {
  const raw = readFileSync(csvPath, "utf-8");
  const lines = raw.trim().split("\n");
  const cards: CardBilingual[] = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i]);
    // columns: index, keyword_de, info_de, keyword_en, info_en
    if (parts.length >= 5) {
      cards.push({
        keyword_de: parts[1],
        info_de: parts[2],
        keyword_en: parts[3],
        info_en: parts[4],
      });
    }
  }

  return cards;
}

function parseCSVLine(line: string): string[] {
  const parts: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current.trim());
  return parts;
}
