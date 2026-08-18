# GIMI Growth Gap Diagnostic - handoff spec for Claude Code

## What this is

A short, self-scoring diagnostic that GIMI Certified Training Partners (CTPs) can send to their
own clients' executives. It exists to solve one specific business problem: prospective CTPs are
refusing to sign the CTP agreement until they see proof that their own client base actually wants
innovation work. This tool lets a CTP test that appetite with real clients, for free, before ever
signing anything, while teaching the client GIMI's vocabulary (Growth Gap, Opportunity Insights,
Fields-of-Play, Business Concepts, Business Case, structured capability) as a side effect of taking
it.

A working v1 is attached as `gimi-growth-gap-diagnostic.html`. It is a single self-contained HTML
file, no build step, no server, no dependencies. Open it in any browser and it runs.

## Hard constraints (do not violate these)

- **No AI anywhere.** Every result the tool produces must come from fixed arithmetic on the
  respondent's own dropdown selections. No LLM calls, no external API calls of any kind. This
  is a deliberate cost and trust decision, not a placeholder to later upgrade to AI. This part
  is still absolute.
- **One network request is now allowed, and only one.** The original spec said no network
  requests at all. Ahmed lifted that on 2026-08-18 so that GIMI and the sending partner can see
  completed diagnostics, which is the whole point of the tool as a CTP sales instrument. The
  single permitted request is a fire and forget POST of the finished submission to a Google
  Apps Script endpoint. It must never block or alter the report, nothing may be fetched back,
  and no third-party script may be added. See `SETUP.md`.
- **The footnote makes no claim about where answers go, in either direction.** Ahmed removed
  the sending and storage statement on 2026-08-18 on the grounds that the diagnostic is
  anonymous: no name and no email address is ever collected. What is left is the no-AI
  statement and the anonymity statement, both of which are true whether or not collection is
  switched on. Do not reintroduce a promise that nothing is sent.
- **A partner may only ever see submissions from their own `?p=` link.** The collection sheet
  is GIMI's alone. It holds every partner's clients, and Google cannot restrict a
  collaborator to a subset of rows, so it is never shared. The Apps Script builds each
  partner a separate filtered spreadsheet instead.
- **No free-text input** except the company name field. Every other input is a dropdown/select
  with fixed options, specifically so nothing can be mistyped.
- **No em dashes anywhere in any copy.**
- **Calibri throughout** (with a system fallback), per GIMI's brand rules.
- **The final capability question must never say "certification" or "training."** It stays framed
  as "structured innovation capability." This is intentional: it is the direct bridge to a training/
  certification sale, and naming it explicitly would make the diagnostic read as a sales pitch
  instead of a genuine assessment.
- **Colors must come only from the real GIMI palette** (below). Do not invent new colors.
- **The GIMI logo must be used as-is**, never recolored, redrawn, stretched, or boxed. `gimi-logo.png`
  is the actual logo asset, already cropped to its bounding box, transparent background.

## Brand palette (confirmed, pulled from an existing GIMI Cowork artifact, not guessed)

| Name       | Hex       | Notes                                  |
|------------|-----------|-----------------------------------------|
| navy       | `#1c3140` | body/heading text                       |
| teal       | `#00858E` | primary brand color                     |
| teal-deep  | `#355E71` | secondary/header color                  |
| teal-dark  | `#00646b` | hover/darker state                      |
| magenta    | `#A43C7C` | accent                                  |
| pink       | `#C96A82` | accent                                  |
| orange     | `#DE8E3D` | accent                                  |
| yellow     | `#EFCE46` | accent (needs dark text on it)          |
| green      | `#B3CE52` | accent (needs dark text on it)          |
| grey-600   | `#5b6673` | secondary text                          |
| grey-300   | `#d8dde3` | borders                                 |
| grey-50    | `#f4f6f8` | page background                         |

Contrast note learned the hard way: teal, teal-deep, and magenta are dark enough that badges/fills
in those colors need **white** text. Pink, orange, yellow, and green are light enough that they need
**dark navy** text. Don't assume dark text is always safe, check contrast ratio (WCAG, aim for
4.5:1 on small text) before assigning text color to any solid accent fill.

## Functional spec

### Setup fields (top of form)
- Company name - free text, only free-text field allowed.
- Seniority - dropdown: C-Suite, VP, Director, Senior Manager.
- Industry - dropdown: Manufacturing & Industrial, Financial Services, Retail & Consumer Goods,
  Healthcare & Life Sciences, Technology & Telecom, Energy & Utilities, Public Sector & Government,
  Professional Services, Other. (Currently informational only, not yet wired into scoring - see
  Open items.)
- Annual revenue - dropdown band: Under $10M, $10-50M, $50-150M, $150-250M, $250M-1B, Over $1B.

### The six question pairs

Each pair asks an **ambition** question ("where you want to be") and a **practice** question
("where you are today"), on the same scale, so the respondent computes their own gap rather than
being told a score. This is the core psychological mechanism, do not collapse pairs into a single
question.

The two questions in a pair sit side by side in equal columns, and **their wording is length
matched so both wrap to the same number of lines** at the 369px column width the page settles
at above 880px. Below 880px the pair stacks, so the question always has a row to itself.
If you reword a question, re-check its partner. A two line question next to a one line
question is the thing this layout exists to avoid.

1. **Growth ambition** (maps to GIMI's Innovation Intent / Growth Gap step). Ambition: "Over the
   next 5 years, what share of revenue do you want coming from offerings that don't exist in your
   portfolio today?" Practice: "What share of your budget or leadership time is explicitly
   dedicated to finding that new revenue today?" Both are % bands. This pair drives the headline
   dollar figure.
2. **Scanning the landscape** (Opportunity Insights). Ambition: "How many markets, segments, or
   trends outside your core business should you be systematically watching for growth
   opportunities?" Practice: "How many are you actually tracking today, in a structured, revisited
   way?" Both are count bands.
3. **Strategic focus** (Fields-of-Play). Ambition: "How many new spaces beyond your core business
   should you have clearly identified and prioritized for growth?" Practice: "How many has your
   leadership team formally agreed on, in writing, today?" Count bands. This pair is designed to
   expose an alignment gap (personal confidence vs. team consensus), not just a knowledge gap.
4. **Pipeline** (Business Concepts). Ambition: "How many genuinely new business concepts (not
   incremental tweaks) should be in active development at any time to hit your growth targets?"
   Practice: "How many are actually in active development right now?" Count bands.
5. **Execution** (Business Case). Ambition: "Of the new ideas your organization generates, what
   share should reach a funded, resourced initiative within 12 months?" Practice: "What share
   actually did, over the last 12 months?" % bands.
6. **People and capability** (the commercial bridge). Ambition: "How many people should build
   stronger, structured innovation capability to execute on these targets?" Practice: "How many
   currently have that structured capability today?" Count bands. Never mention certification.

Each question card also has a "Why" line, in the section's accent color, that teaches the GIMI term
for that gap without over-explaining. See the HTML for exact current copy, tune freely but keep the
teaching function.

### Scoring engine (100% deterministic, see `<script>` in the HTML for the reference implementation)

**Band midpoint lookup tables:**
- Percentage bands: 0-10% → 5, 10-20% → 15, 20-30% → 25, 30-40% → 35, 40%+ → 50.
- Count bands: 0 → 0, 1-2 → 1.5, 3-5 → 4, 6-10 → 8, 10+ → 12.
- Revenue bands (in $M): Under $10M → 5, $10-50M → 30, $50-150M → 100, $150-250M → 200,
  $250M-1B → 400, Over $1B → 1500.

**Two hero numbers:**
- Growth Gap $ = (Pair 1 ambition midpoint − Pair 1 practice midpoint) / 100 × revenue midpoint.
  Floor at 0.
- Capability Gap (headcount) = Pair 6 ambition midpoint − Pair 6 practice midpoint. Floor at 0.

**Ranked exposure list** (pairs 2-5 only): relative gap = (ambition − practice) / ambition × 100,
capped 0-100. If ambition = 0, relative gap = 0 (not a divide-by-zero error). Sort descending,
tie-break by earliest step in the process order (pair 2 before 3 before 4 before 5), since an
earlier-step gap is more foundational and causes the downstream ones. Feature the top 1-2 in the
output with their templated sentence.

**Output has no overall score or grade.** Deliberately avoided a 0-100 "maturity score" because it
reads as a report card people resent. Instead: two concrete numbers (a dollar figure, a headcount)
plus a ranked list of where the gap concentrates, framed as an opportunity map.

### Output/report content
- Respondent line: "Diagnostic for [Company], [Industry], completed by a [Seniority] respondent."
- Hero 1: Growth Gap $, hero 2: Capability Gap headcount.
- Ranked exposure list, top 2 items max, each with a "Biggest exposure" / "Second" tag.
- One "stakes" line referencing GIMI's Innovation Premium concept (pricing power, cost of capital,
  partner preference, talent attraction) as what closing the gap unlocks.
- One CTA line naming GIMI's five-step Innovation Breakthrough Process, telling the respondent to
  talk to whoever shared the tool with them (the CTP), not GIMI directly.
- A visible footnote disclosing that everything is calculated client-side with fixed formulas, no
  AI, no data sent anywhere, nothing stored. This is a real trust signal for client-facing use, keep
  it visible.

## What's already built

`gimi-growth-gap-diagnostic.html` is a working, tested v1: all 6 pairs, setup fields including
industry, full scoring engine, GIMI palette, real logo embedded as a base64 data URI in the header
with a thin multi-color strip pulled from the logo's own arc colors, badge contrast fixed and
verified against WCAG contrast ratios, no em dashes, JS syntax-checked with `node --check`.

## Open items / possible next steps (not yet requested, flagging for awareness)

- Industry is captured but not yet used to vary question wording or scoring. Could branch copy by
  industry later.
- ~~No persistence layer.~~ Done on 2026-08-18. Completed diagnostics post to a Google Sheet
  via Apps Script, attributed to a partner through a `?p=code` link. GIMI reads the sheet,
  each partner gets a separate spreadsheet filtered to their own code and never the sheet
  itself. See `SETUP.md`. Real peer benchmarking, meaning replacing the static Innovation
  Premium stakes line with figures drawn from actual responses, is still not built and needs
  enough submissions to be meaningful first.
- No PDF/export option yet, results only render on-screen.
- No multi-respondent alignment comparison yet (sending to 2-3 execs at the same client and diffing
  their answers on the Fields-of-Play pair), which was discussed as a strong future feature for CTP
  account expansion but is not built.
- Revenue and count bands are fixed globally. If certain industries need different band ranges
  (e.g., a public-sector agency's "revenue" concept doesn't map cleanly), that would need per-
  industry band tables.

## File inventory in this handoff

- `index.html` - the working tool, open directly in a browser. This was
  `gimi-growth-gap-diagnostic.html` in the original handoff, renamed so that the GitHub Pages
  URL resolves without a filename.
- `gimi-logo.png` - the real GIMI logo, transparent background, cropped to content.
- `apps-script/Code.gs` - the submission collector that runs on the Google Sheet.
- `SETUP.md` - how to switch collection on, and who sees what.
- `README.md` - orientation for anyone opening the repo.
- `HANDOFF.md` - this file.

## Suggested opening prompt for the new Claude Code session

"Attached is a working single-file HTML diagnostic tool (gimi-growth-gap-diagnostic.html) and its
full spec (HANDOFF.md). Read HANDOFF.md first, it has hard constraints (no AI, no em dashes, exact
brand colors, no free text except company name) that must not be violated. Then [describe what you
want built next, e.g., 'turn this into a proper multi-page app with a results history', or 'add the
industry-based question branching described in Open items', or whatever the next concrete ask is]."
