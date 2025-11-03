# 🔡 ASCII → עברית (Hebrew) Phonetic Mapping — Final Revision (A–Z, 1:1)

Each **English key** maps to exactly one **Hebrew consonant**.  
Vowels (`a`, `o`, `u`, `i`, `j`) act as phonetic modifiers and Alef-carriers when initial.

---

| EN | HE | Hebrew Name | Role / Note |
|----|----|--------------|-------------|
| a | א | Alef | Vowel carrier if initial |
| b | ב | Bet | — |
| c | צ / ץ | Tsadi | final ץ at word end |
| d | ד | Dalet | — |
| e | ע | Ayin | voiced pharyngeal (ʕ) |
| f | פ / ף | Pe | final ף at word end |
| g | ג | Gimel | — |
| h | ה | He | — |
| i | י | Yod | also vowel `i` |
| j | י | Yod | alias for `i` |
| k | כ / ך | Kaf | final ך at word end |
| l | ל | Lamed | — |
| m | מ / ם | Mem | final ם at word end |
| n | נ / ן | Nun | final ן at word end |
| o | וֹ | Holam / Vav | vowel “o”; adds וֹ |
| p | פ / ף | Pe | same as `f`; redundancy optional |
| q | ק | Qof | deep k (“quaf”) |
| r | ר | Resh | — |
| s | ס | Samekh | — |
| t | ת | Tav | — |
| u | וּ | Shuruk / Vav | vowel “u” |
| v | ו | Vav (consonant) | consonant “v/w” |
| w | שׁ | Shin | — |
| x | ח | Chet | harsh “ch” sound |
| y | ט | Tet | — |
| z | ז | Zayin | — |

---

## 🪄 Structural / Phonetic Rules

- **Start vowels** (`a`, `o`, `u`, `i`, `j`) → prepend **א** if no consonant before.  
  - e.g. `aor` → **אוֹר**
- **Mater lectionis (vowel letters):**
  - `o` → וֹ
  - `u` → וּ
  - `i`/`j` → י when between consonants
- **Final forms** applied automatically:
  - כ→ך, מ→ם, נ→ן, פ→ף, צ→ץ

---

## 🧠 Notes for Engine Implementation

- Maintain **final-form substitution** on last character.  
- Treat `i`, `j` equivalently (`י`).  
- Treat `f`, `p` equivalently (`פ`).  
- When leading character is a vowel (`a`, `o`, `u`, `i`, `j`), insert **א** as base.  
- When `e` appears initially, do **not** insert Alef — it is **Ayin** (ע).

---

## ✅ Example Words with New Mapping

| ASCII | Hebrew | Meaning |
|--------|---------|----------|
| aor | אוֹר | Light |
| mayim | מַיִם | Water |
| qol | קוֹל | Voice |
| xayim | חַיִּים | Life |
| aw | אֵשׁ | Fire |
| dabar | דָּבָר | Word |
| emet | אֱמֶת | Truth |
| malak | מַלְאַךְ | Angel |
| arur | אָרוּר | Curse |
| beraka | בְּרָכָה | Blessing |

---


# 🧙‍♂️ BILEAM – DER LEHRLING DES WORTES
## LEVELS.MD – DIDACTIC & STORY STRUCTURE

---

## 🌟 DIDACTIC STRUCTURE

Each level follows three phases (except L1):

1. **Review (Riddle Phase):**  
   Reuse previous words in context (open doors, create bridges, etc.).  
   Reinforces memory & recognition.

2. **Learning (Dialog Phase):**  
   New word introduced through story dialog and guided input.  
   Player sees transliteration + Hebrew rendering once.

3. **Application (Challenge Phase):**  
   Player uses the new word autonomously to solve an obstacle.  
   Mistakes trigger adaptive hints or reset options.

Fallback system:
- **1st mistake:** Esel gives contextual hint.  
- **2nd mistake:** “Memory flashback” → short recall scene.  
- **3rd mistake:** Option to “Meditate” → reset to learning phase.

---

# LEVEL 1 – אוֹר (*aor* – Light)

### Phase 1 – (No Review, Introduction)

**Scene:** Inside a dark hut.  
**Dialog:**
- *Narrator:* „Ein Lehrling erwacht im Dunkel…“  
- *Esel:* „Siehst du was?“  
- *Bileam:* „Nein… aber ich fühle ein Wort.“  
- *Prompt:* *Type:* `aor` → **אוֹר**  
  - ✅ *Success:* Room fills with light.  
  - ❌ *Fail:* Esel: „Versuch’s nochmal – das Wort für Licht ist kurz, aber hell.“

### Phase 2 – Learn
- Word: **אוֹר (aor)** – “Light”
- Guided input: Player repeats `aor` 3× with timing meter.

### Phase 3 – Apply
- Door in the back is sealed.  
- *Hint:* “The door reacts to light.”  
- *Prompt:* `aor`  
  - ✅ Door opens.  
  - ❌ Esel: “Kein Licht, keine Tür – willst du nochmal üben?” → retry.

---

# LEVEL 2 – מַיִם (*mayim* – Water)

### Phase 1 – Review
- Scene: Small stream outside.  
- Bridge collapsed; wooden planks float nearby.  
- *Prompt:* “Erhelle das Wasser, um den Weg zu sehen.”  
  - *Type:* `aor` → **אוֹר**  
  - ✅ The stream glows, revealing stepping stones.  
  - ❌ Hint: “Erinner dich an das erste Wort…”

### Phase 2 – Learn
- *Esel:* “Du brauchst einen Weg über das Wasser.”  
- *Bileam:* “Das Wort lautet *mayim* – Wasser.”  
- *Prompt:* `mayim` → **מַיִם**  
  - ✅ Water rises, forming platforms.  
  - ❌ Esel: “Majim? Nein – mit *m* beginnen!”

### Phase 3 – Apply
- Player must type `mayim` repeatedly to keep platforms afloat.  
- Three crossings required.  
- Misspelling → platform sinks → checkpoint reload.

Fallback: After two failed crossings, Esel appears:  
> “Vielleicht musst du das Wort fühlen – m… a… yim…”

---

# LEVEL 3 – קוֹל (*qol* – Voice)

### Phase 1 – Review
- Scene: Cave mouth with echoing halls.  
- *Prompt 1:* “Rufe das Wasser herbei.”  
  - *Type:* `mayim` → **מַיִם** → flow clears path.  
- *Prompt 2:* “Erhelle die Wandinschrift.”  
  - *Type:* `aor` → **אוֹר** → reveals runes.

### Phase 2 – Learn
- *Bileam:* “Die Wände sprechen zurück… das ist *qol* – Stimme.”  
- *Prompt:* `qol` → **קוֹל**  
  - ✅ Echo answers with same sound.  
  - ❌ Hint: “Ein kurzes Wort, das klingt wie dein Ruf.”

### Phase 3 – Apply
- Player faces an echo gate that only opens by typing `qol` in rhythm (3×).  
- Missed beat → gate resets, echo taunts.  
- After two fails → Esel: “Sprich, nicht dröhne – flüstere das Wort!”

---

# LEVEL 4 – חַיִּים (*xayim* – Life)

### Phase 1 – Review
- Scene: Overgrown garden gate.  
- *Prompt 1:* “Bring Licht.” → `aor`  
- *Prompt 2:* “Lass Wasser fließen.” → `mayim`  
- ✅ Plants respond, but path still blocked by wilted vine.

### Phase 2 – Learn
- *Bileam:* “Dies ist der Garten des Lebens – das Wort: *xayim*.”  
- *Prompt:* `xayim` → **חַיִּים**  
  - ✅ Vines bloom; birds sing.  
  - ❌ Esel: “Vielleicht beginnt es mit einem rauen Atemlaut?”

### Phase 3 – Apply
- Puzzle: Player must grow three plants using `xayim` in sequence.  
- Misspell one → plant withers → restart.  
- After two fails → Esel: “Das Leben kommt in Wellen – sprich sanft.”

---

# LEVEL 5 – אֵשׁ (*aw* – Fire)

### Phase 1 – Review
- Scene: Dark cavern with dripping water and strange runes.  
- *Prompt 1:* “Lass das Wasser fließen.” → `mayim`  
- *Prompt 2:* “Gib Licht.” → `aor`  
- Hidden spark appears in rune circle.

### Phase 2 – Learn
- *Bileam:* “Feuer ist reinigend. Das Wort ist *aw* – Flamme.”  
- *Prompt:* `aw` → **אֵשׁ**  
  - ✅ Flame ignites.  
  - ❌ Hint: “Kurz wie ein Atemstoß – *a…w*.”

### Phase 3 – Apply
- Lava barrier ahead.  
- Sequence challenge: extinguish with water (`mayim`), then reignite forge with `aw`.  
- Failing order = explosion, reload checkpoint.

Fallback: After 2 fails, cinematic memory replay shows Bileam repeating `aw` at the forge.

---

# LEVEL 6 – דָּבָר (*dabar* – Word)

### Phase 1 – Review
- Scene: Marketplace.  
- *Prompt 1:* “Bring Licht zum Stand.” → `aor`  
- *Prompt 2:* “Lass die Pflanzen wachsen.” → `xayim`  
- Market awakens.

### Phase 2 – Learn
- *Bileam:* “Ein Wort kann handeln wie Gold. *dabar* bedeutet ‘Wort’.”  
- *Prompt:* `dabar` → **דָּבָר**  
  - ✅ Händler applaudieren.  
  - ❌ Esel: “Nicht ‘daWar’, denk an das sanfte b in der Mitte.”

### Phase 3 – Apply
- Dialogue choice: Convince a guard to open gate.  
- Player types `dabar` during conversation for persuasion.  
- Misspelling → guard confused → Esel hints:  
  > “Vielleicht sprichst du zu laut – versuch das Wort für Sprache selbst.”

---

# LEVEL 7 – אֱמֶת (*emet* – Truth)

### Phase 1 – Review
- Scene: Mirror tower, illusions distort.  
- *Prompt 1:* “Erhelle den Pfad.” → `aor`  
- *Prompt 2:* “Sprich das Wort, das Türen öffnet.” → `dabar`  
- Path partially clears.

### Phase 2 – Learn
- *Bileam:* “Nur Wahrheit kann Spiegel durchdringen – *emet*.”  
- *Prompt:* `emet` → **אֱמֶת**  
  - ✅ Mirrors align.  
  - ❌ Hint: “Es beginnt sanft wie dein erstes Wort mit *e*.”

### Phase 3 – Apply
- Boss: Shadow Bileam mirrors actions.  
- Only correct `emet` at right moment dispels him.  
- 3 failed attempts → mirror shatters → reset to learning phase (reflection replay).

---

# LEVEL 8 – מַלְאַךְ (*malak* – Angel)

### Phase 1 – Review
- Scene: Desert path; the Esel halts.  
- *Prompt:* “Sprich die Worte des Lebens.”  
  - Player types sequence: `aor → mayim → qol → xayim → aw → dabar → emet`  
  - ✅ An ethereal shimmer appears.

### Phase 2 – Learn
- *Bileam:* “Ich sehe – ein *malak*, ein Bote.”  
- *Prompt:* `malak` → **מַלְאַךְ**  
  - ✅ Angel manifests.  
  - ❌ Esel: “Das letzte Zeichen ist ein Laut des Endes – weich, nicht hart.”

### Phase 3 – Apply
- Angel tests memory: repeats 4 random previous words, player must type correctly.  
- 3 wrong answers → angel fades, restart phase.

---

# LEVEL 9 – אָרוּר / בְּרָכָה (*arur* / *beraka*)

### Phase 1 – Review
- Scene: King Balak’s throne room.  
- *Prompt:* “Schenke dem König ein Zeichen.”  
  - `aor` or `dabar` both acceptable → audience calms.

### Phase 2 – Learn
- *Balak:* “Verfluche Israel!”  
- *Esel (flüsternd):* “Aber du kennst auch das Wort für Segen.”  
- *Prompt A:* `arur` → **אָרוּר** – Fluch  
- *Prompt B:* `beraka` → **בְּרָכָה** – Segen  
  - ✅ Either word accepted, but moral choice affects ending.

### Phase 3 – Apply
- During ritual, player must type either `arur` or `beraka`.  
- Choosing `beraka` triggers divine light; `arur` darkens hall.  
- Player can retry once after seeing consequence; Esel asks:  
  > “Willst du’s diesmal anders sprechen?”

---

# LEVEL 10 – FINAL: Transformation

### Phase 1 – Review
- Scene: Valley overlooking Israel’s camp.  
- *Prompt:* “Erinnere dich an alle Worte.”  
  - Player recites full sequence:  
    `aor mayim qol xayim aw dabar emet malak beraka`  
  - ✅ Energy builds.

### Phase 2 – Learning Through Revelation
- *Bileam:* “Ich öffne meinen Mund – doch ein anderes Wort spricht.”  
- Player begins typing `arur`.  
- Letters morph automatically into **בְּרָכָה (beraka)**.

### Phase 3 – Apply (Resolution)
- Scripting triggers cinematic transformation:
  - The curse becomes a blessing.
  - The Esel: “Wer das Wort bewahrt, wird selbst bewahrt.”
- Player control fades; all learned words scroll by.

Fallbacks:
- If player forgets order in Phase 1, glowing glyphs cycle hints in correct sequence.
- Option “Meditate” restarts review phase.

---

# 🧩 DIDACTIC SUMMARY

| Phase | Cognitive Focus | Teaching Method | Feedback Type |
|--------|------------------|------------------|----------------|
| 1 – Review | Recall | Contextual repetition | Visual success cues |
| 2 – Learn | Comprehension | Dialog & demonstration | Esel hints |
| 3 – Apply | Transfer | Problem-solving & sequence recall | Success animation / Retry loop |

Progression:
- **L1–L3:** Immediate feedback, guided learning.  
- **L4–L7:** Increasing memory recall, multi-step tasks.  
- **L8–L10:** Full word sequence mastery, moral reasoning, symbolic transformation.

---

# ⚙️ MEMORY LOOP SYSTEM (Fallback Logic)

**Each spell prompt has:**
- First fail → *Hint line* (contextual).  
- Second fail → *Memory flashback scene* (replay of learning phase).  
- Third fail → *Choice menu*:  
  - “Retry here” (loop)  
  - “Meditate” (relearn word in safe space)

**Example logic pseudocode:**

