# Turning on submission collection

By default this diagnostic sends nothing anywhere. `SUBMIT_ENDPOINT` in `index.html` is an
empty string. Follow the steps below to collect completed diagnostics in a Google Sheet that
GIMI owns.

The diagnostic is anonymous. It never asks for a name or an email address, so what lands in
the sheet is a company and its answers, not an identified person.

## 1. Create the sheet

1. In the GIMI Google Workspace account, create a new Google Sheet.
2. Name it something like **GIMI Growth Gap Diagnostic, submissions**.
3. You do not need to add headers. The script creates them on the first submission.

## 2. Add the collector script

1. In that sheet, go to **Extensions, Apps Script**.
2. Delete whatever is in `Code.gs`.
3. Paste the full contents of [`apps-script/Code.gs`](apps-script/Code.gs) from this repo.
4. Save.

## 3. Deploy it as a web app

1. Click **Deploy, New deployment**.
2. Choose type **Web app**.
3. Set **Execute as** to **Me**.
4. Set **Who has access** to **Anyone**.

   This has to be **Anyone**, not "Anyone with a Google account". Client executives taking
   the diagnostic are not signed in to Google, and the submission is anonymous.
5. Click **Deploy**, then authorize when prompted.

   Google shows an "unverified app" warning the first time, because this is your own script
   rather than a published add-on. Click **Advanced**, then **Go to (your project name)**,
   then **Allow**.
6. Copy the **Web app URL**. It ends in `/exec`.

## 4. Point the diagnostic at it

1. Open `index.html` and find this line near the top of the `<script>` block:

   ```js
   const SUBMIT_ENDPOINT = "";
   ```
2. Paste your `/exec` URL between the quotes.
3. Commit and push. GitHub Pages redeploys in a minute or two.
4. Complete the diagnostic once yourself and confirm a row lands in the sheet.

## 5. Give each partner their own link

Add `?p=` and a short code for the partner to the end of the URL:

```
https://aelharouchi01.github.io/gimi-growth-gap-diagnostic/?p=acme-consulting
```

That code is recorded in the **CTP code** column against every submission from that link.
The respondent never sees it and has nothing extra to fill in. Anyone arriving without a
code is recorded as `unattributed`.

Keep the codes lowercase, no spaces. Anything outside letters, numbers, hyphen and
underscore is stripped out before it is sent.

## 6. The admin console

Everything below can be done from one page, which is the thing to bookmark:

**https://script.google.com/a/macros/ixl-center.net/s/AKfycbzYlTeV6mOs0c0scajC30HIfmdrhsAeV4V0xsL3EItQ_gt9LVDI8oGgAlORi9YcUBhy0w/exec**

It is a second deployment of the same script, restricted to the organisation, so Google
sign-in is the lock and there is no password in any file. Opening it while signed out, or
from an outside account, gets you nothing. It lets you:

- Type a partner name and get their link, copied to the clipboard, in one click. The code is
  derived from the name, so "Acme Consulting" becomes `?p=acme-consulting`.
- See every submission in a readable table, filtered by partner.
- See per partner: how many clients completed it, their average growth gap, and the exposure
  that comes up most. That last one is the evidence a prospective CTP actually wants.
- Build a partner their filtered sheet with the Create button.

Registered partners are kept on a `Partners` tab in the same spreadsheet, so a partner you
have created a link for shows up even before anyone has completed the diagnostic.

To redeploy after editing the code, use **Deploy, Manage deployments**, pick **admin
console**, pencil, **Version: New version**. The collector is a separate deployment in the
same list and has its own version, so updating one does not update the other.

## 7. Who sees what

**GIMI** opens the collection sheet directly. That is the admin view, and it is the only
place the full picture exists.

**A partner sees only the submissions that came through their own link. Never the
collection sheet.** That sheet holds every other partner's clients, and Google cannot
restrict a collaborator to a subset of rows, so there is no safe way to share it. Sharing it
once, even read only, exposes every partner's pipeline to a competitor.

The script builds the safe version for you. In the collection sheet, use the **GIMI** menu
in the toolbar:

- **Create a partner view...** asks for the partner's code and creates a separate
  spreadsheet containing only their rows, then gives you its URL. Open it once and approve
  the `IMPORTRANGE` prompt, otherwise it sits on `#REF!`. Then share that file, and nothing
  else, with the partner.
- **List partner codes seen so far** shows which codes have come in and how many
  submissions each has, which is the quickest way to check a partner's link is working.

The view stays live. New submissions on that partner's link appear in their sheet on their
own, and they still cannot see anything outside their own code.

## Changing the script later

Editing the code is not enough on its own. Go to **Deploy, Manage deployments**, click the
pencil, set **Version** to **New version**, and deploy. If you instead create a brand new
deployment you get a brand new URL and have to update `index.html` again.

## What this does and does not protect

The web app URL is visible in the page source, because it has to be for the browser to post
to it. That is acceptable here because the script is append only. There is no code path in
it that returns stored data, so the URL cannot be used to read anybody's submissions. A
determined person could post a junk row. They cannot pull the sheet.

If that ever stops being good enough, the answer is a real backend with authentication, not
a secret hidden in client-side JavaScript, because there is no such thing.

## Before you switch this on

Once collection is live, the tool is handling client executives' answers about their own
business. Two things worth settling first:

- The footnote says no name and no email address is asked for, which is true, and it makes
  no claim either way about where the answers go. That is a deliberate choice. Worth checking
  it is the right one for regulated markets, or whether the partner agreement should carry a
  line about it instead.
- The sheet accumulates named companies over time. Decide who at GIMI owns it, and whether
  there is a retention limit.
