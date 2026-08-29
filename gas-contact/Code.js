// Frontway お問い合わせ受付バックエンド
// フォーム送信(JSON) → スプレッドシートに記録 → Google Chat通知(webhook設定時) + メール通知
//
// 運用メモ:
// - Chat webhook を設定するときは CHAT_WEBHOOK_URL に貼って clasp push --force するだけ
// - 記録先シートは初回アクセス時に自動作成され、URLはdoGet(WebアプリのURLをブラウザで開く)で確認できる

var NOTIFY_EMAIL = 't_Nakayama@frontway.jp';
// Google Chat webhook URLはスクリプトプロパティ CHAT_WEBHOOK_URL に保存（公開リポジトリに含めないため）
function getChatWebhookUrl_() {
  return PropertiesService.getScriptProperties().getProperty('CHAT_WEBHOOK_URL') || '';
}
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

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// スプレッドシートの数式インジェクション対策 + 長さ制限
function clean_(v, max) {
  v = String(v || '').slice(0, max);
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

function doPost(e) {
  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    // application/x-www-form-urlencoded で来た場合のフォールバック
    data = (e && e.parameter) ? e.parameter : {};
  }

  // ハニーポット: 人間には見えないフィールドが埋まっていたらbot（botには成功と見せて捨てる）
  if (data.website) return jsonOut_({ ok: true });

  var form = clean_(data.form || 'お問い合わせ', 30);
  var type = clean_(data.type || data.position, 100);
  var name = clean_(data.name, 100);
  var email = String(data.email || '').slice(0, 200);
  var company = clean_(data.company, 200);
  var message = clean_(data.message, 5000);

  // 必須項目・メール形式の検証
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonOut_({ ok: false, error: 'invalid' });
  }

  // 全体レートリミット: 10分あたり20件まで（フォーム連投対策）
  var cache = CacheService.getScriptCache();
  var count = Number(cache.get('rate_count') || 0);
  if (count >= 20) return jsonOut_({ ok: false, error: 'rate_limited' });
  cache.put('rate_count', String(count + 1), 600);

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

  var chatWebhookUrl = getChatWebhookUrl_();
  if (chatWebhookUrl) {
    try {
      UrlFetchApp.fetch(chatWebhookUrl, {
        method: 'post',
        contentType: 'application/json; charset=UTF-8',
        payload: JSON.stringify({ text: summary }),
        muteHttpExceptions: true
      });
    } catch (err) { /* Chat通知失敗でも受付自体は成功させる */ }
  }

  try {
    MailApp.sendEmail(NOTIFY_EMAIL, ('【Frontway】' + form + ': ' + (name || email)).replace(/[\r\n]/g, ' '), summary);
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
