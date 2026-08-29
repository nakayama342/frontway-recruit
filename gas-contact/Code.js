// Frontway お問い合わせ受付バックエンド
// フォーム送信(JSON) → スプレッドシートに記録 → Google Chat通知(webhook設定時) + メール通知
//
// 運用メモ:
// - Chat webhook を設定するときは CHAT_WEBHOOK_URL に貼って clasp push --force するだけ
// - 記録先シートは初回アクセス時に自動作成され、URLはdoGet(WebアプリのURLをブラウザで開く)で確認できる

var NOTIFY_EMAIL = 't_Nakayama@frontway.jp';
var CHAT_WEBHOOK_URL = ''; // Google Chatスペースの incoming webhook URL（未設定なら通知スキップ）
var SHEET_NAME = 'Frontway 問い合わせ一覧';
var HEADERS = ['受信日時', 'フォーム', 'ご希望の内容 / 職種', 'お名前', 'メールアドレス', '会社名', 'メッセージ'];

function getSheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  var ss;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (err) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(SHEET_NAME);
    props.setProperty('SHEET_ID', ss.getId());
  }
  var sheet = ss.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return { ss: ss, sheet: sheet };
}

function doPost(e) {
  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    // application/x-www-form-urlencoded で来た場合のフォールバック
    data = (e && e.parameter) ? e.parameter : {};
  }

  var form = String(data.form || 'お問い合わせ');
  var type = String(data.type || data.position || '');
  var name = String(data.name || '');
  var email = String(data.email || '');
  var company = String(data.company || '');
  var message = String(data.message || '');
  var now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

  var target = getSheet_();
  target.sheet.appendRow([now, form, type, name, email, company, message]);

  var summary =
    '【' + form + '】新しい問い合わせが届きました\n' +
    '受信日時: ' + now + '\n' +
    '内容/職種: ' + type + '\n' +
    'お名前: ' + name + '\n' +
    'メール: ' + email + '\n' +
    (company ? '会社名: ' + company + '\n' : '') +
    'メッセージ:\n' + message + '\n\n' +
    '一覧: ' + target.ss.getUrl();

  if (CHAT_WEBHOOK_URL) {
    try {
      UrlFetchApp.fetch(CHAT_WEBHOOK_URL, {
        method: 'post',
        contentType: 'application/json; charset=UTF-8',
        payload: JSON.stringify({ text: summary }),
        muteHttpExceptions: true
      });
    } catch (err) { /* Chat通知失敗でも受付自体は成功させる */ }
  }

  try {
    MailApp.sendEmail(NOTIFY_EMAIL, '【Frontway】' + form + ': ' + (name || email), summary);
  } catch (err) { /* メール失敗でも受付自体は成功させる */ }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ブラウザでWebアプリURLを開くと、シートを準備して記録先URLを表示する（動作確認用）
function doGet() {
  var target = getSheet_();
  return ContentService
    .createTextOutput('Frontway 問い合わせ受付は稼働中です。\n記録先スプレッドシート: ' + target.ss.getUrl())
    .setMimeType(ContentService.MimeType.TEXT);
}
