/**
 * GIMI Growth Gap Diagnostic, submission collector and admin console.
 *
 * This one script project is deployed twice.
 *
 *   1. "v1 collector", access Anyone.
 *      The diagnostic posts finished submissions here. Anonymous by necessity,
 *      because client executives are not signed in to Google. doGet on this
 *      deployment returns nothing but a refusal, because an anonymous visitor
 *      never satisfies the check in isAdmin_().
 *
 *   2. "admin console", access restricted to the organisation.
 *      Serves the admin page. Reads the sheet, builds partner links, creates
 *      the filtered spreadsheets that partners are given.
 *
 * There is deliberately no way to read stored data without passing isAdmin_(),
 * so the collector URL sitting in the diagnostic's public page source cannot be
 * used to pull anybody's submissions. The worst it allows is a junk row.
 *
 * Setup instructions live in SETUP.md in the repo.
 */

var DIAGNOSTIC_URL = 'https://aelharouchi01.github.io/gimi-growth-gap-diagnostic/';

var SHEET_NAME = 'Submissions';
var PARTNERS_SHEET_NAME = 'Partners';

/* Who may open the admin console. The deployment's own access setting is the
   first gate, this is the second. Add an address here to let in someone whose
   domain is not listed, for example a GIMI colleague on giminstitute.org. */
var ALLOWED_DOMAINS = ['ixl-center.net', 'giminstitute.org'];
var ALLOWED_EMAILS = [];

var HEADERS = [
  'Received',
  'CTP code',
  'Company',
  'Seniority',
  'Industry',
  'Revenue band',
  'Q1 growth ambition, target',
  'Q1 growth ambition, today',
  'Q2 scanning, target',
  'Q2 scanning, today',
  'Q3 strategic focus, target',
  'Q3 strategic focus, today',
  'Q4 pipeline, target',
  'Q4 pipeline, today',
  'Q5 execution, target',
  'Q5 execution, today',
  'Q6 capability, target',
  'Q6 capability, today',
  'Growth gap ($M)',
  'Capability gap (people)',
  'Biggest exposure',
  'Second exposure'
];

var PARTNER_HEADERS = ['Code', 'Partner name', 'Created', 'Partner view URL'];

/* Column positions in the Submissions sheet, 1 based. */
var COL_RECEIVED = 1;
var COL_CODE = 2;
var COL_COMPANY = 3;
var COL_SENIORITY = 4;
var COL_INDUSTRY = 5;
var COL_REVENUE = 6;
var COL_GROWTH_GAP = 19;
var COL_CAPABILITY_GAP = 20;
var COL_BIGGEST = 21;
var COL_SECOND = 22;

var STEP_NAMES = {
  p2: 'Scanning the landscape',
  p3: 'Strategic focus',
  p4: 'Pipeline',
  p5: 'Execution'
};

/* ==========================================================================
 * Collector
 * ======================================================================= */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput('no payload');
    }

    var data = JSON.parse(e.postData.contents);
    var a = data.answers || {};
    var top = data.topExposures || [];
    var sheet = getSheet_();

    sheet.appendRow([
      new Date(),
      trim_(data.ctp) || 'unattributed',
      trim_(data.company),
      trim_(data.seniority),
      trim_(data.industry),
      trim_(data.revenueBand),
      pick_(a.p1, 0), pick_(a.p1, 1),
      pick_(a.p2, 0), pick_(a.p2, 1),
      pick_(a.p3, 0), pick_(a.p3, 1),
      pick_(a.p4, 0), pick_(a.p4, 1),
      pick_(a.p5, 0), pick_(a.p5, 1),
      pick_(a.p6, 0), pick_(a.p6, 1),
      numberOrBlank_(data.growthGapM),
      numberOrBlank_(data.capabilityGap),
      STEP_NAMES[top[0]] || '',
      STEP_NAMES[top[1]] || ''
    ]);

    return ContentService.createTextOutput('ok');
  } catch (err) {
    logFailure_(err);
    return ContentService.createTextOutput('error');
  }
}

/* ==========================================================================
 * Admin console
 * ======================================================================= */

function doGet() {
  if (!isAdmin_()) {
    return ContentService.createTextOutput(
      'This endpoint only accepts diagnostic submissions. It does not return stored data.'
    );
  }

  return HtmlService.createHtmlOutputFromFile('Admin')
    .setTitle('GIMI Growth Gap Diagnostic, admin')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function isAdmin_() {
  var email = '';
  try {
    email = Session.getActiveUser().getEmail() || '';
  } catch (err) {
    return false;
  }
  if (!email) return false;

  if (ALLOWED_EMAILS.indexOf(email.toLowerCase()) !== -1) return true;

  var domain = email.split('@')[1] || '';
  return ALLOWED_DOMAINS.indexOf(domain.toLowerCase()) !== -1;
}

function requireAdmin_() {
  if (!isAdmin_()) {
    throw new Error('You are not signed in to an account that may view this.');
  }
}

/**
 * Everything the admin page needs, in one round trip.
 */
function adminData() {
  requireAdmin_();

  var submissions = readSubmissions_();
  var partners = readPartners_();
  var byCode = {};

  partners.forEach(function (p) {
    byCode[p.code] = p;
    p.count = 0;
    p.growthGaps = [];
    p.exposures = {};
  });

  submissions.forEach(function (s) {
    var code = s.code || 'unattributed';
    if (!byCode[code]) {
      byCode[code] = {
        code: code,
        name: '',
        created: '',
        viewUrl: '',
        count: 0,
        growthGaps: [],
        exposures: {},
        unregistered: true
      };
      partners.push(byCode[code]);
    }
    var p = byCode[code];
    p.count++;
    if (typeof s.growthGap === 'number') p.growthGaps.push(s.growthGap);
    if (s.biggest) p.exposures[s.biggest] = (p.exposures[s.biggest] || 0) + 1;
  });

  partners.forEach(function (p) {
    p.avgGrowthGap = p.growthGaps.length
      ? Math.round(p.growthGaps.reduce(function (a, b) { return a + b; }, 0) / p.growthGaps.length)
      : null;
    p.topExposure = topKey_(p.exposures);
    p.link = DIAGNOSTIC_URL + '?p=' + encodeURIComponent(p.code);
    delete p.growthGaps;
    delete p.exposures;
  });

  partners.sort(function (a, b) {
    if (b.count !== a.count) return b.count - a.count;
    return a.code < b.code ? -1 : 1;
  });

  return {
    email: Session.getActiveUser().getEmail(),
    diagnosticUrl: DIAGNOSTIC_URL,
    sheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    partners: partners,
    submissions: submissions,
    totals: {
      submissions: submissions.length,
      partners: partners.filter(function (p) { return !p.unregistered; }).length
    }
  };
}

/**
 * Register a partner and hand back their link. Idempotent on the code.
 */
function adminAddPartner(name) {
  requireAdmin_();

  var clean = String(name || '').trim();
  if (!clean) throw new Error('Give the partner a name.');

  var code = slugify_(clean);
  if (!code) throw new Error('That name has no letters or numbers in it to build a code from.');

  var sheet = getPartnersSheet_();
  var existing = readPartners_();

  for (var i = 0; i < existing.length; i++) {
    if (existing[i].code === code) {
      return adminData();
    }
  }

  sheet.appendRow([code, clean, new Date(), '']);
  return adminData();
}

/**
 * Build the separate, filtered spreadsheet that a partner is given.
 * The collection sheet itself is never shared with a partner.
 */
function adminCreatePartnerView(code) {
  requireAdmin_();

  var clean = String(code || '').trim();
  if (!clean || !/^[A-Za-z0-9_-]+$/.test(clean)) {
    throw new Error('That is not a usable partner code.');
  }

  var source = SpreadsheetApp.getActiveSpreadsheet();
  var partners = readPartners_();
  var name = clean;

  for (var i = 0; i < partners.length; i++) {
    if (partners[i].code === clean && partners[i].name) {
      name = partners[i].name;
    }
  }

  var view = SpreadsheetApp.create('GIMI Growth Gap Diagnostic, ' + name);
  var sheet = view.getActiveSheet();
  sheet.setName('Their submissions');

  sheet.getRange('A1').setFormula(
    '=QUERY(IMPORTRANGE("' + source.getUrl() + '", "' + SHEET_NAME + '!A:V"), ' +
    '"select * where Col2 = \'' + clean + '\'", 1)'
  );
  sheet.setFrozenRows(1);

  recordPartnerViewUrl_(clean, view.getUrl());

  return { url: view.getUrl(), code: clean, name: name };
}

/* ==========================================================================
 * Sheet access
 * ======================================================================= */

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#1c3140')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function getPartnersSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(PARTNERS_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(PARTNERS_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(PARTNER_HEADERS);
    sheet.getRange(1, 1, 1, PARTNER_HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#00858E')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function readSubmissions_() {
  var sheet = getSheet_();
  var last = sheet.getLastRow();
  if (last < 2) return [];

  var rows = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var out = [];

  rows.forEach(function (r) {
    out.push({
      received: formatDate_(r[COL_RECEIVED - 1]),
      code: String(r[COL_CODE - 1] || 'unattributed').trim(),
      company: String(r[COL_COMPANY - 1] || ''),
      seniority: String(r[COL_SENIORITY - 1] || ''),
      industry: String(r[COL_INDUSTRY - 1] || ''),
      revenue: String(r[COL_REVENUE - 1] || ''),
      growthGap: typeof r[COL_GROWTH_GAP - 1] === 'number' ? r[COL_GROWTH_GAP - 1] : null,
      capabilityGap: typeof r[COL_CAPABILITY_GAP - 1] === 'number' ? r[COL_CAPABILITY_GAP - 1] : null,
      biggest: String(r[COL_BIGGEST - 1] || ''),
      second: String(r[COL_SECOND - 1] || '')
    });
  });

  out.reverse();
  return out;
}

function readPartners_() {
  var sheet = getPartnersSheet_();
  var last = sheet.getLastRow();
  if (last < 2) return [];

  return sheet.getRange(2, 1, last - 1, PARTNER_HEADERS.length).getValues()
    .filter(function (r) { return String(r[0]).trim(); })
    .map(function (r) {
      return {
        code: String(r[0]).trim(),
        name: String(r[1] || '').trim(),
        created: formatDate_(r[2]),
        viewUrl: String(r[3] || '').trim()
      };
    });
}

function recordPartnerViewUrl_(code, url) {
  var sheet = getPartnersSheet_();
  var last = sheet.getLastRow();

  if (last >= 2) {
    var codes = sheet.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < codes.length; i++) {
      if (String(codes[i][0]).trim() === code) {
        sheet.getRange(i + 2, 4).setValue(url);
        return;
      }
    }
  }

  sheet.appendRow([code, code, new Date(), url]);
}

/* ==========================================================================
 * Sheet menu, kept so the console is not the only way in
 * ======================================================================= */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('GIMI')
    .addItem('Create a partner view...', 'createPartnerViewFromMenu')
    .addItem('List partner codes seen so far', 'listPartnerCodes')
    .addToUi();
}

function createPartnerViewFromMenu() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt(
    'Create a partner view',
    'Partner code, exactly as it appears in their link after ?p=',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  try {
    var result = adminCreatePartnerView(response.getResponseText());
    ui.alert(
      'Partner view created',
      'Open it once and approve the IMPORTRANGE prompt, otherwise it will sit on #REF!.\n\n' +
      'Then share this file, and nothing else, with ' + result.code + ':\n\n' + result.url,
      ui.ButtonSet.OK
    );
  } catch (err) {
    ui.alert(String(err.message || err));
  }
}

function listPartnerCodes() {
  var sheet = getSheet_();
  var ui = SpreadsheetApp.getUi();
  var last = sheet.getLastRow();

  if (last < 2) {
    ui.alert('No submissions yet.');
    return;
  }

  var codes = {};
  sheet.getRange(2, COL_CODE, last - 1, 1).getValues().forEach(function (row) {
    var code = String(row[0]).trim();
    if (code) codes[code] = (codes[code] || 0) + 1;
  });

  var lines = Object.keys(codes).sort().map(function (code) {
    return code + ': ' + codes[code];
  });

  ui.alert('Partner codes and submission counts', lines.join('\n'), ui.ButtonSet.OK);
}

/* ==========================================================================
 * Helpers
 * ======================================================================= */

function slugify_(s) {
  return String(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function topKey_(counts) {
  var best = '';
  var bestN = 0;
  Object.keys(counts || {}).forEach(function (k) {
    if (counts[k] > bestN) {
      bestN = counts[k];
      best = k;
    }
  });
  return best;
}

function formatDate_(v) {
  if (!v) return '';
  if (Object.prototype.toString.call(v) !== '[object Date]') return String(v);
  return Utilities.formatDate(v, Session.getScriptTimeZone(), 'd MMM yyyy, HH:mm');
}

function trim_(v) {
  return v === null || v === undefined ? '' : String(v).trim().slice(0, 200);
}

function pick_(arr, i) {
  return arr && arr[i] ? String(arr[i]).slice(0, 60) : '';
}

function numberOrBlank_(v) {
  return typeof v === 'number' && isFinite(v) ? v : '';
}

function logFailure_(err) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var log = ss.getSheetByName('Errors') || ss.insertSheet('Errors');
    log.appendRow([new Date(), String(err)]);
  } catch (ignored) {
    // Never let logging break the response.
  }
}
