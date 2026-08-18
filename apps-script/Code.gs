/**
 * GIMI Growth Gap Diagnostic, submission collector.
 *
 * Append only by design. There is no endpoint here that returns stored data,
 * so the public web app URL sitting in the diagnostic's page source cannot be
 * used to read anyone's submissions. The worst it allows is a junk row.
 *
 * Setup instructions live in SETUP.md in the repo.
 */

var SHEET_NAME = 'Submissions';

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

var STEP_NAMES = {
  p2: 'Scanning the landscape',
  p3: 'Strategic focus',
  p4: 'Pipeline',
  p5: 'Execution'
};

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

function doGet() {
  return ContentService.createTextOutput(
    'This endpoint only accepts diagnostic submissions. It does not return stored data.'
  );
}

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
