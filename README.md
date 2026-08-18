# GIMI Growth Gap Diagnostic

A short, self-scoring innovation diagnostic that GIMI Certified Training Partners (CTPs)
can send to their own clients' executives.

**Live:** https://aelharouchi01.github.io/gimi-growth-gap-diagnostic/

## What it is

Six paired questions. Each pair asks where the respondent wants to be (ambition) and where
they are today (practice), on the same scale, so the respondent computes their own gap
rather than being handed a score. The output is two concrete numbers, a Growth Gap in
dollars and a Capability Gap in headcount, plus a ranked list of where the gap concentrates.

Taking it teaches the client GIMI's vocabulary as a side effect: Growth Gap, Opportunity
Insights, Fields-of-Play, Business Concepts, Business Case, structured capability.

## How it works

One self-contained HTML file. No build step, no server, no dependencies, no third-party
scripts. Every result comes from fixed arithmetic on the respondent's own dropdown
selections. No AI is involved at any point.

To run it locally, open `index.html` in any browser.

## Seeing the responses

Collection is off in the shipped file, and while it is off the tool sends nothing anywhere.

Switch it on and each completed diagnostic appends a row to a Google Sheet that GIMI owns.
That sheet is the admin view and the only place the full picture exists. Partners come in on
their own link, `?p=their-code`.

**A partner only ever sees submissions from their own link.** The collection sheet is never
shared with them. The Apps Script has a GIMI menu that builds each partner a separate
spreadsheet filtered to their code, which is the thing you share.

The diagnostic is anonymous. It asks for no name and no email address.

## Running it

There is one admin page, restricted to the organisation by Google sign-in, which builds
partner links, shows every submission, summarises each partner's results and creates the
per-partner sheets. It is a second deployment of the same Apps Script, so no password lives
in any file here.

Full instructions, including the admin URL, are in [SETUP.md](SETUP.md).

## Files

| File | Purpose |
|------|---------|
| `index.html` | The tool. Everything is in here, including the logo as a base64 data URI. |
| `gimi-logo.png` | The source logo asset, transparent background, cropped to content. |
| `apps-script/Code.gs` | The append-only collector that runs on the Google Sheet. |
| `SETUP.md` | How to switch collection on, and who sees what. |
| `HANDOFF.md` | Full spec: hard constraints, brand palette, question set, scoring engine, open items. |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is. |

## Before changing anything

Read `HANDOFF.md`. It carries hard constraints that must not be violated: no AI anywhere, no
free text except the company name, no em dashes, exact GIMI brand colors only, and the
capability question never says "certification" or "training". Exactly one network request is
permitted, the submission POST described above, and the footnote must keep deriving itself
from whether that is switched on.
