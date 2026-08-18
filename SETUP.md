# Turning on submission collection

By default this diagnostic sends nothing anywhere. `SUBMIT_ENDPOINT` in `index.html` is an
empty string, and the footnote the respondent sees says their answers are not sent anywhere
and nothing is stored. That is the shipped state and it is accurate.

Follow the steps below to collect completed diagnostics in a Google Sheet that GIMI owns.
The footnote changes by itself the moment the endpoint is filled in, so the disclosure and
the behaviour can never drift apart.

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

## 6. Who sees what

**GIMI** opens the sheet directly. That is the admin view, and it holds every submission
from every partner.

**A partner** should never be given access to the collection sheet itself, because Google
cannot restrict a collaborator to a subset of rows. Give each partner their own separate
sheet that pulls only their rows:

```
=QUERY(IMPORTRANGE("<collection sheet URL>", "Submissions!A:V"), "select * where Col2 = 'acme-consulting'", 1)
```

Share that sheet with the partner and nothing else. You will be asked to approve the
`IMPORTRANGE` connection once, the first time.

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

- The footnote discloses the sharing, but check whether GIMI wants anything stronger in
  front of respondents in regulated markets, or a note in the partner agreement.
- The sheet accumulates named companies over time. Decide who at GIMI owns it, and whether
  there is a retention limit.
