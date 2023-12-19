import * as enWords from "@/database/raw/en_words.json";
import * as trWords from "@/database/raw/tr_words.json";
import * as wordleWords from "@/database/raw/wordle_words.json";

import { db, englishWords, turkishWords, wordleEnglishWords, wordleTurkishWords } from "@/globals";

await db.insert(englishWords).values(enWords);
await db.insert(turkishWords).values(trWords);
await db.insert(wordleEnglishWords).values(wordleWords.en);
await db.insert(wordleTurkishWords).values(wordleWords.tr);
console.log("Word deployment successfull!");