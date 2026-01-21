# Novel Git (仮)

執筆者の「迷い」を資産に変える、バージョン管理機能付き小説エディタ。
従来のテキストエディタにはない「執筆プロセスの可視化」を実現し、プログラミングにおけるGitの利便性を小説執筆向けに再定義します。

## 主な機能 (予定含む)

*   **縦書き/横書き切り替え**: ボタン一つでレイアウトを変更可能
*   **オートセーブ & ローカルDB**: 執筆内容はブラウザ内のIndexedDBに自動保存
*   **履歴スナップショット**: 任意のタイミングで版を保存し、過去の状態に戻れる
*   **比較機能 (Diff)**: 過去の版と現在の版を並べて比較
*   **PWA (Progressive Web App)**: アプリとしてインストール可能、オフライン動作対応

## 技術スタック

*   **Frontend**: React (Vite), TypeScript
*   **Styling**: Tailwind CSS, CSS Modules
*   **State Management**: Zustand
*   **Database**: Dexie.js (IndexedDB wrapper)
*   **PWA**: vite-plugin-pwa

## 環境構築手順

このプロジェクトは Node.js 環境で動作します。

### 前提条件

*   Node.js (v18, v20, またはそれ以上)
*   npm (Node.jsに含まれています)

### インストール

リポジトリをクローンし、依存パッケージをインストールします。

```bash
# リポジトリのクローン
git clone https://github.com/N0ntar0/Nit-Novel-Git-.git
cd Nit-Novel-Git-

# 依存パッケージのインストール
npm install
```

### 開発サーバーの起動

ローカルで開発用サーバーを立ち上げます。
起動後、ブラウザで `http://localhost:5173` にアクセスしてください。

```bash
npm run dev
```

### アプリケーションのビルド

本番環境向けにファイルをビルドします。`dist` フォルダに生成されます。

```bash
npm run build
```

### プレビュー

ビルドされたアプリケーションをローカルで確認します。

```bash
npm run preview
```
