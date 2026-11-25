// Lista canônica de 104 verbos irregulares derivada de `src/content/data/irregularVerbs.ts`
// (alinhada com `public/past/verbs.js`).

import { IRREGULAR_VERBS } from "../data/irregularVerbs.ts";
import type { SchoolIrregularVerb } from "./types";

export const SCHOOL_IRREGULAR_VERBS: SchoolIrregularVerb[] = IRREGULAR_VERBS.map(
  (verb) => ({
    base: verb.baseForm,
    past: verb.simplePast,
    participle: verb.pastParticiple,
    translation: verb.translation,
  }),
);
