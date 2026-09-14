# trade-pnl

ブラウザだけで動く、個人向けのデイトレード損益管理アプリです。日次損益をリスト・グラフ・カレンダー・年間リストで確認し、月次合計と通算損益を追跡できます。サーバーやアカウントは不要で、データはブラウザの `localStorage` に保存されます。

A personal day-trade P&L tracker that runs entirely in the browser. Review daily results in list, chart, calendar, and yearly spreadsheet views. No backend or login; data stays in `localStorage`.

## Features

- 日次の損益・項目（複数）・メモの登録
- 月ごとのリスト（月次損益 / 通算損益）
- 期間指定のグラフ（日次損益・期間累計）
- カレンダー表示
- 年間リスト（日×月の表、月末の「修正後」残高）
- 項目タグと損益金額の色ルール
- 初期繰越金と月末残高の修正

## Requirements

- Node.js 18 以上（20 系推奨）

## Setup

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

本番ビルド:

```bash
npm run build
npm start
```

## Privacy

損益データは端末のブラウザ内にだけ保存されます。リポジトリに個人の取引履歴は含まれません。初回起動時には動作確認用のサンプルデータが入ることがあります。設定画面からサンプルへ戻せます。

## Tech

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- lucide-react

## License

[MIT](LICENSE)
