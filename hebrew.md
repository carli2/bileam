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
- Player restores hut light using `aor` to exit.

### Phase 2 – Learn
- River scene: Bileam must shape a water bridge using **מַיִם**.

### Phase 3 – Apply
- Puzzle: Sequence of platforms that raise when `mayim` is typed correctly.
- Fallback hints describe sound “ma-yim”.

---

# LEVEL 3 – קוֹל (*qol* – Voice)

### Review
- Reuse `aor`, `mayim` to traverse echo chamber.

### Learn
- Whisper to stone doors: `qol` activates sonic resonance.

### Apply
- Boss: Stone guardian requiring alternating `mayim` and `qol`.
- Mistakes trigger Esel hint (“Sprich klar: KOL!”).

---

# LEVEL 4 – חַיִּים (*xayim* – Life)

### Review
- Combine `aor`, `mayim`, `qol` to reawaken garden.

### Learn
- Teach Bileam to revive plants with `xayim`.

### Apply
- Heal bridge vines using `xayim` while dodging obstacles.

---

# LEVEL 5 – אֵשׁ (*aw* – Fire)

### Review
- Player uses `aor`, `mayim`, `xayim` to balance elements.

### Learn
- Volcano trial introduces `aw` for controlled flame.

### Apply
- Feuergolem battle requiring combos of `mayim` and `aw`.

---

# LEVEL 6 – דָּבָר (*dabar* – Word)

### Review
- Market scene: recall earlier spells to solve riddles.

### Learn
- Esel explains power of “דָּבָר”.

### Apply
- Player persuades guard via correct typing of `dabar`.

---

# LEVEL 7 – אֱמֶת (*emet* – Truth)

### Review
- Mirror tower uses `aor`, `dabar` for entry.

### Learn
- Angelic voice demands `emet`.

### Apply
- Shadow self battle where `emet` dispels illusions.

---

# LEVEL 8 – מַלְאַךְ (*malak* – Angel)

### Review
- Desert travel recites entire set up to now.

### Learn
- Encounter angel; learn `malak`.

### Apply
- Memory test: sequential prompts of previous words.

---

# LEVEL 9 – אָרוּר / בְּרָכָה (*arur* / *beraka*)

### Review
- Balak’s court: demonstrate earlier words for favor.

### Learn
- Introduce duality of curse (`arur`) vs blessing (`beraka`).

### Apply
- Player chooses during ritual; moral outcome stored.

---

# LEVEL 10 – FINAL – Transformation

### Review
- Recite entire lexicon to summon power.

### Learn
- Attempt to type `arur`; text morphs into `beraka` automatically.

### Apply
- Automatic blessing cutscene; words scroll as epilogue.

---

# ⚙️ MEMORY LOOP SYSTEM

Every prompt keeps failure count:
1. Hint bubble.
2. Flashback (replay Learn phase).
3. Choice (Retry vs Meditate).

Pseudo-code provided earlier for state machine.
