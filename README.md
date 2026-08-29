# 株式会社Frontway 公式サイト

公開URL: https://frontway.jp

## 全体構成（設計図）

```
[閲覧者]
   │
   ▼
https://frontway.jp（ConoHa WING / 静的サイト + .htaccessでセキュリティヘッダー）
   │
   ├─ index.html      … コーポレートTOP（ABOUT / SERVICE / NEWS / CAREERS / CONTACT）
   ├─ news.html       … ニュース一覧
   ├─ company.html    … 会社概要
   ├─ privacy.html    … プライバシーポリシー
   ├─ sitemap.xml / robots.txt … SEO用（Search Console登録済み）
   ├─ css/site.css    … 共通スタイル
   ├─ js/site.js      … 共通スクリプト（背景演出・ナビ・フォーム送信＋確認モーダル）
   └─ careers/        … 採用サイト（※特殊: 下記「careersの注意点」参照）
        ├─ index.html … 採用トップ（dc形式 / ../support.js が描画）
        └─ sales.html / ai-dx.html / bizdev.html … 募集要項（通常の静的HTML）

[問い合わせ・採用エントリーフォーム] --送信--> Google Apps Script（gas-contact/ が元コード）
   ├─ スプレッドシート「Frontway 問い合わせ一覧」に記録
   ├─ Google Chat スペース「問い合わせ・入電」に通知（webhook / URLはGASのスクリプトプロパティに保存）
   └─ t_Nakayama@frontway.jp へメール通知
```

## デプロイフロー

```
main へ push
  ↓
GitHub Actions「Deploy to ConoHa WING」（.github/workflows/deploy.yml）
  ↓
ConoHa WING の public_html/frontway.jp/ へ SCP で自動デプロイ（上書きのみ・削除なし）
  ↓
https://frontway.jp に反映（サーバーキャッシュで反映に1分程度かかることがある）
```

- 転送対象は deploy.yml の scp 行の許可リストのみ。**新しいファイルを追加したら deploy.yml への追記を忘れない**
- GitHub Pages（nakayama342.github.io/frontway-recruit）も動いているが**本番ではない**（canonicalでfrontway.jpを正としている）

## 変更時のルール

| 変更対象 | 手順 |
|---|---|
| HTML の文言・内容 | 編集 → commit → push（自動デプロイ） |
| css/site.css | 編集後、**全HTMLの `site.css?v=日付` を新しい日付に更新**（キャッシュバスター）|
| js/site.js | 同上（`site.js?v=日付` を更新）|
| 採用トップ | `Frontway Recruit v2.dc.html` を編集後、`sed 's\|src="./support.js"\|src="../support.js"\|' "Frontway Recruit v2.dc.html" > careers/index.html` で再生成 |
| ニュース記事追加 | news.html に記事を追加 + index.html のNEWSセクションの最新2件を更新 + sitemap.xml のlastmod更新 |
| フォーム処理（GAS） | gas-contact/ を編集 → `clasp push --force` → `clasp redeploy <デプロイID>`（pushだけでは本番に反映されない）|

## careersの注意点（ハマりどころ）

- 採用トップは React ベースの独自ランタイム（support.js）で描画される。support.js は
  **`new Function` と unpkg.com のReact CDN** を使うため、サイト共通のCSPでは動かない
- そのため `careers/.htaccess` で careers 配下のみ `unsafe-eval` と `https://unpkg.com` を許可している
- **ルートの .htaccess のCSPを変更したら careers/.htaccess も忘れずに確認すること**
- CSP等ブラウザ挙動に関わる変更後は、headless Chrome で実描画とコンソールエラーを確認する
  （curlのHTTP 200だけでは検証にならない）

## セキュリティ（実装済み）

- .htaccess: HSTS / X-Frame-Options / nosniff / Referrer-Policy / Permissions-Policy / CSP / ディレクトリ一覧無効
- フォーム: ハニーポット（`website` フィールド）/ 送信前確認モーダル /
  GAS側で入力検証・文字数制限・シート数式インジェクション対策・レートリミット（10分20件）
- Chat webhook URL は公開リポジトリに置かず、GASのスクリプトプロパティ `CHAT_WEBHOOK_URL` に保存

## 変更履歴について

変更履歴は git が正（`git log --oneline` で全履歴、各コミットに変更理由を記載）。
別ファイルでの履歴管理はしない。

## 未対応・今後の課題

- 募集要項3ページの給与・勤務地・勤務時間等（TODOコメント付きの `<dd>`）が「準備中」のまま
- 会社概要の連絡先メールアドレス未掲載
- ブログ/コラム欄（営業×AIの実務ノウハウ記事、週1〜2本・AI下書き＋人間監修の方針）は構想段階
- Googleビジネスプロフィール未登録
