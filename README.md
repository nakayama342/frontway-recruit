# Frontway 採用ブランディングサイト v2

## 内容
- `Frontway Recruit v2.dc.html` — サイト本体（1ファイル完結）
- `support.js` — レンダリングランタイム（同じフォルダに置いたまま使用）

## 開き方
`Frontway Recruit v2.dc.html` をブラウザで直接開くだけで動作します。
※ `support.js` を同一フォルダに残してください。

## 構造の説明（VSCode で編集する場合）
このファイルは `<x-dc>` テンプレート + ロジッククラスの2部構成です。

- `<x-dc> ... </x-dc>` の中 = マークアップ（インラインスタイルのみ）
- 末尾の `<script data-dc-script>` の中 = `class Component extends DCLogic { ... }`
  - `renderVals()` の戻り値がテンプレートの `{{ }}` に入ります
  - `componentDidMount()` にローディング演出／パーティクル／3Dチルト／スクロール出現の処理があります

### テンプレート記法
- `{{ path }}` … ドット参照のみ（式は書けません。計算は `renderVals()` 側で行う）
- `<sc-for list="{{ items }}" as="item">` … 繰り返し
- `style-hover="..."` … ホバー時スタイル

### 主要な編集ポイント
| やりたいこと | 場所 |
|---|---|
| コピー・見出しの変更 | テンプレート内の該当 `<h1>` / `<h2>` / `<p>` |
| カード・ポジション等の内容 | ロジッククラス `renderVals()` の `whyCards` / `cultures` / `works` / `positions` |
| 配色 | テンプレート内の `#4f7cff`（青）/ `#8b5cf6`（紫）/ `#04060f`（背景）を置換 |
| ローディング時間 | `componentDidMount()` の progress ステップ間隔 |
| 背景パーティクル密度 | `this.props.particleDensity ?? 100` |
| アニメーション定義 | 先頭 `<helmet><style>` 内の `@keyframes` |

## カラー
- 背景 `#04060f`
- パネル `rgba(12,17,34,.75)`
- アクセント青 `#4f7cff` / 紫 `#8b5cf6` / シアン `#22d3ee`
- テキスト `#e8ecf8` / `#aab4d4` / `#95a0c2`

## フォント
- 日本語: Noto Sans JP (400/500/700/900)
- 英字・数字: Space Grotesk (400/500/600/700)

## React へ移植する場合
テンプレートは JSX にほぼ 1:1 で置き換えられます。
- `class` → `className`、`style="a:b"` → `style={{a:'b'}}`
- `<sc-for list as>` → `items.map(...)`
- `style-hover` → CSS Modules / styled-components / Tailwind の `hover:` に置換
- `componentDidMount()` の各処理 → `useEffect`（パーティクル canvas、IntersectionObserver、ローダー、チルト）
