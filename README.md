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

One self-contained HTML file. No build step, no server, no dependencies, no network
requests of any kind. Every result comes from fixed arithmetic on the respondent's own
dropdown selections. Nothing is sent anywhere and nothing is stored.

To run it locally, open `index.html` in any browser.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The tool. Everything is in here, including the logo as a base64 data URI. |
| `gimi-logo.png` | The source logo asset, transparent background, cropped to content. |
| `HANDOFF.md` | Full spec: hard constraints, brand palette, question set, scoring engine, open items. |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is. |

## Before changing anything

Read `HANDOFF.md`. It carries hard constraints that must not be violated: no AI and no
network calls, no free text except the company name, no em dashes, exact GIMI brand colors
only, and the capability question never says "certification" or "training".
