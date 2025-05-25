# GitHub Actions CI/CD Setup

このプロジェクトは GitHub Actions を使用した CI/CD パイプラインを設定しています。

## ワークフロー

### 1. CI (ci.yml)
- **トリガー**: main, develop ブランチへの push と pull request
- **実行内容**:
  - ESLint チェック
  - TypeScript 型チェック
  - Main process テスト
  - Renderer テスト
  - アプリケーションビルド
  - クロスプラットフォーム Electron アプリビルド

### 2. Pull Request Tests (pr-test.yml)
- **トリガー**: Pull Request作成時
- **実行内容**:
  - 全テストの実行
  - コードカバレッジの計測
  - Codecov への結果アップロード

### 3. Release (release.yml)
- **トリガー**: `v*` タグの push
- **実行内容**:
  - 全テストの実行
  - クロスプラットフォーム配布パッケージの作成
  - GitHub Releases への自動アップロード

## 必要な設定

### GitHub Secrets
以下のシークレットをリポジトリに設定してください：

1. **CODECOV_TOKEN** (オプション)
   - Codecov でコードカバレッジを追跡する場合に必要
   - [Codecov](https://codecov.io/) でプロジェクトを作成し、トークンを取得

2. **GITHUB_TOKEN**
   - GitHub Actions で自動的に提供される
   - リリース時のアーティファクトアップロードに使用

### ブランチ保護ルール
推奨設定：

1. **main ブランチ**:
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Required status checks: `test (ubuntu-latest, 18)`, `test (ubuntu-latest, 20)`

2. **develop ブランチ**:
   - Require pull request reviews before merging
   - Require status checks to pass before merging

## ローカル開発でのテスト実行

```bash
# 全テストの実行
pnpm test:run

# Main process テスト
pnpm test:main

# Renderer テスト
pnpm test:renderer:run

# ESLint チェック
pnpm lint

# TypeScript 型チェック
pnpm typecheck

# カバレッジ付きテスト
pnpm test:coverage
```

## ビルドコマンド

```bash
# 開発ビルド
pnpm build

# プラットフォーム別リリースビルド
pnpm build:win     # Windows
pnpm build:mac     # macOS
pnpm build:linux   # Linux
```
