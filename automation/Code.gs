/**
 * 新作カフェカレンダー用のGoogle Apps Script。
 * このファイルを公開用スプレッドシートに紐づくApps Scriptプロジェクトへ貼り付けて使います。
 */

const CONFIG = {
  pendingSheetName: '確認待ち',
  publishedSheetName: '公開用',
  timezone: 'Asia/Tokyo',
  brands: [
    { name: 'Starbucks', url: 'https://www.starbucks.co.jp/press_release/pr.php' },
    { name: "TULLY'S", url: 'https://www.tullys.co.jp/company/pressrelease/2026_index.html' },
    { name: 'Gong cha', url: 'https://www.gongcha.co.jp/pressrelease/' },
    { name: 'コメダ', url: 'https://www.komeda.co.jp/news/' }
  ]
};

const PENDING_HEADERS = [
  '取得日時', 'ブランド', '記事タイトル', '公式記事URL', '推定発売日',
  'カテゴリ', '商品名', '説明', '公開', '公開済み', 'メモ'
];

const PUBLISHED_HEADERS = [
  '登録日時', '発売日', 'ブランド', 'カテゴリ', '商品名', '説明', '公式URL'
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('カフェカレンダー')
    .addItem('公式記事を取得', 'collectOfficialArticles')
    .addItem('承認済み商品を公開用シートへ反映', 'publishApprovedProducts')
    .addToUi();
}

function setupSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(spreadsheet, CONFIG.pendingSheetName, PENDING_HEADERS);
  ensureSheet_(spreadsheet, CONFIG.publishedSheetName, PUBLISHED_HEADERS);
}

/** 毎日実行するトリガーに設定する関数です。 */
function collectOfficialArticles() {
  setupSheets();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.pendingSheetName);
  const existingUrls = getColumnValues_(sheet, 4);
  const rows = [];

  CONFIG.brands.forEach(brand => {
    try {
      const html = UrlFetchApp.fetch(brand.url, {
        muteHttpExceptions: true,
        headers: { 'User-Agent': 'CafeCalendarBot/1.0 (Google Apps Script)' }
      }).getContentText();

      if (!html) return;
      extractArticleLinks_(html, brand.url).forEach(article => {
        if (!existingUrls.has(article.url)) {
          rows.push([
            new Date(), brand.name, article.title, article.url,
            guessReleaseDate_(article.title), guessCategory_(article.title), '', '',
            false, false, ''
          ]);
          existingUrls.add(article.url);
        }
      });
    } catch (error) {
      console.warn(`${brand.name} の取得に失敗しました: ${error}`);
    }
  });

  if (rows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, PENDING_HEADERS.length).setValues(rows);
  }
}

/**
 * 確認待ちシートで「公開」がTRUEの商品を公開用シートへ1回だけ追加します。
 * 商品名・発売日・カテゴリ・説明を確認してから公開にチェックしてください。
 */
function publishApprovedProducts() {
  setupSheets();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const pending = spreadsheet.getSheetByName(CONFIG.pendingSheetName);
  const published = spreadsheet.getSheetByName(CONFIG.publishedSheetName);
  const values = pending.getDataRange().getValues();
  const newRows = [];
  const publishedFlags = [];

  values.slice(1).forEach(row => {
    const [collectedAt, brand, title, sourceUrl, releaseDate, category, name, description, approved, publishedAlready] = row;
    if (approved === true && publishedAlready !== true) {
      if (!releaseDate || !category || !name || !sourceUrl) {
        throw new Error(`「${title}」に発売日・カテゴリ・商品名・公式URLを入力してください。`);
      }
      newRows.push([new Date(), normalizeDate_(releaseDate), brand, category, name, description || title, sourceUrl]);
      publishedFlags.push(true);
    } else {
      publishedFlags.push(publishedAlready === true);
    }
  });

  if (newRows.length) {
    published.getRange(published.getLastRow() + 1, 1, newRows.length, PUBLISHED_HEADERS.length).setValues(newRows);
    pending.getRange(2, 10, publishedFlags.length, 1).setValues(publishedFlags.map(value => [value]));
  }
}

function createDailyTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'collectOfficialArticles')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger('collectOfficialArticles').timeBased().everyDays(1).atHour(7).create();
}

function ensureSheet_(spreadsheet, name, headers) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getColumnValues_(sheet, column) {
  if (sheet.getLastRow() < 2) return new Set();
  return new Set(sheet.getRange(2, column, sheet.getLastRow() - 1, 1).getValues().flat().filter(Boolean));
}

function extractArticleLinks_(html, baseUrl) {
  const results = [];
  const seen = new Set();
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = anchorRegex.exec(html)) !== null) {
    const title = stripHtml_(match[2]);
    if (!title || title.length < 8 || !/(発売|新商品|限定|新作|メニュー|ドリンク|フード)/.test(title)) continue;
    const url = new URL(match[1], baseUrl).href;
    if (!url.startsWith('http') || seen.has(url)) continue;
    seen.add(url);
    results.push({ title, url });
  }
  return results.slice(0, 30);
}

function guessReleaseDate_(text) {
  const match = text.match(/(20\d{2})?[年/.\-\s]*(\d{1,2})月(\d{1,2})日/);
  if (!match) return '';
  const year = match[1] ? Number(match[1]) : new Date().getFullYear();
  return `${year}/${String(match[2]).padStart(2, '0')}/${String(match[3]).padStart(2, '0')}`;
}

function guessCategory_(text) {
  if (/(ドリンク|ラテ|コーヒー|ティー|フラペチーノ|シェイク)/.test(text)) return 'drink';
  if (/(フード|ケーキ|スイーツ|サンド|パン|バーガー)/.test(text)) return 'food';
  return 'other';
}

function normalizeDate_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, CONFIG.timezone, 'yyyy/MM/dd');
  }
  return String(value).replaceAll('-', '/').replaceAll('.', '/');
}

function stripHtml_(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}
