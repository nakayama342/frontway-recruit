# 株式会社Frontway 公式サイト

公開URL: https://nakayama342.github.io/frontway-recruit/

## サイト構成

```
index.html            … コーポレートTOP（ABOUT / SERVICE / CAREERS導線 / CONTACT）
company.html          … 会社概要
privacy.html          … プライバシーポリシー
careers/index.html    … 採用トップ（Mission / Why / Culture / 数字で見るFrontway / 募集職種 / ENTRY）
careers/sales.html    … 募集要項: 営業 / セールス
careers/ai-dx.html    … 募集要項: AI・DX / 業務改善
careers/bizdev.html   … 募集要項: 事業開発 / BizDev
css/site.css          … コーポレートページ共通スタイル
js/site.js            … コーポレートページ共通スクリプト（パーティクル・メニュー・出現アニメ）
support.js            … 採用トップ（dc形式）のレンダリングランタイム
Frontway Recruit v2.dc.html … 採用トップの編集用ソース（下記参照）
```

## 更新方法

ファイルを編集して `git add -A && git commit -m "..." && git push` すると、1〜2分で公開URLに反映されます。

### よくある更新

| やりたいこと | 場所 |
|---|---|
| 給与・勤務地など募集条件の確定情報を入れる | `careers/sales.html` / `ai-dx.html` / `bizdev.html` の「募集要項」`<dl>` 内の各 `<dd>`（`TODO` コメント付き） |
| 会社所在地を入れる | `company.html` の「所在地」の `<dd>` |
| 数字で見るFrontwayの数値変更 | `careers/index.html` の `data-count` 属性と説明文 |
| コーポレートTOPのコピー変更 | `index.html` |

### 採用トップ（careers/index.html）の編集

`Frontway Recruit v2.dc.html` が編集用ソースです（`<x-dc>` テンプレート + DCLogic クラスの2部構成。
テンプレート記法や編集ポイントの詳細はファイル内コメント参照）。編集後、以下で反映します:

```sh
sed 's|src="./support.js"|src="../support.js"|' "Frontway Recruit v2.dc.html" > careers/index.html
```

## 注意事項

- **フォームは未接続です**: TOPのお問い合わせフォームと採用ENTRYフォームは、送信先バックエンドが未設定のダミーです（送信しても completions メッセージが出るだけ）。Googleフォーム / Formspree 等への接続が必要です。
- カラー: 背景 `#04060f` / アクセント青 `#4f7cff`・紫 `#8b5cf6`・シアン `#22d3ee`
- フォント: Noto Sans JP（日本語）/ Space Grotesk（英字・数字）
