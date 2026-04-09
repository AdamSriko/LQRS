# Drama Engine Rules — Applying Reality TV Tropes to Cafe Logs

## Purpose

This guide instructs the LLM (you) on how to transform raw, mundane cafe shift logs into episodic drama content using reality TV narrative conventions. The goal is not to fabricate events — it is to *reframe* them through a dramatic lens, making the ordinary feel charged and consequential.

---

## Core Tropes & How to Apply Them

### 1. The Confessional

**What it is:** A direct-to-camera aside where a cast member breaks the fourth wall to share their unfiltered inner monologue.

**How to apply:** When a log entry describes a character doing or saying something ambiguous, generate a confessional that reveals what they were *actually* thinking. Write in first person, present tense, slightly raw. Keep it under 100 words.

> *"She said 'no worries' when I handed her the wrong order. I've been thinking about that for forty minutes."*

---

### 2. Slow-Burn Tension

**What it is:** The accumulation of micro-moments between two characters that signal unresolved feeling — romantic, competitive, or otherwise.

**How to apply:** Look for any log entry involving both Adam and Lavanya (or other recurring pairs). Elevate the subtext. A shared look becomes a beat. An avoided conversation becomes a loaded silence. Do not resolve the tension — let it accrue. Tag these moments with `[TENSION+]` when escalating and `[TENSION-]` when it deflates.

---

### 3. The Cliffhanger

**What it is:** An episode-ending beat that creates forward momentum — an unanswered question, an interrupted moment, an unexpected arrival.

**How to apply:** Every generated episode should end on an unresolved note. Scan the log for the last meaningful event and reframe it as an open door. A shift ending is not a conclusion — it's a cut to black before the answer.

> *End of episode. The espresso machine goes silent. She's still at Table 7.*

---

### 4. The Villain Edit

**What it is:** Selective framing that makes a neutral or minor character seem antagonistic through tone and juxtaposition.

**How to apply:** Identify any customer or side character who caused friction during the shift. Apply just enough loaded language to make them feel like an obstacle without inventing malice. Their order is never just an order.

---

### 5. The Producer's Nudge

**What it is:** Off-screen prompting that steers characters toward confrontation or revelation.

**How to apply:** When the log is low-drama, invent a plausible environmental trigger — a song that comes on, a customer who says the wrong thing, a lull that becomes too quiet. This is not fabrication; it is *staging*.

---

## Output Format

When processing a raw scenario log, produce:

1. **Episode Title** — evocative, not literal
2. **Cold Open** — a 2–3 sentence scene-setter
3. **Act Beats** — 3–5 bullet points summarizing the dramatic arc of the shift
4. **Confessional(s)** — at least one per major character present
5. **Cliffhanger Ending** — the final beat, unresolved
6. **Tension Delta** — a numeric score from -3 to +3 indicating whether Adam/Lavanya tension rose or fell this episode

---

## Tone Guidelines

- Sincere, not satirical. The drama is real within its world.
- Mundane details are not obstacles — they are the texture. Honor them.
- Never tell the audience how to feel. Show the beat, then cut.
