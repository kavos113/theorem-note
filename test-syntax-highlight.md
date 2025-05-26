# シンタックスハイライトテスト

このファイルは、マークダウンエディタのシンタックスハイライト機能をテストするためのファイルです。

## JavaScript

```javascript
function greeting(name) {
  console.log(`Hello, ${name}!`);
  return `Welcome to ${name}`;
}

const user = 'World';
greeting(user);

// 配列とオブジェクト
const numbers = [1, 2, 3, 4, 5];
const person = {
  name: 'John',
  age: 30,
  skills: ['JavaScript', 'TypeScript', 'Vue.js']
};
```

## TypeScript

```typescript
interface User {
  id: number;
  name: string;
  email?: string;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  findUser(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }
}

const userService = new UserService();
userService.addUser({ id: 1, name: 'Alice', email: 'alice@example.com' });
```

## Python

```python
def fibonacci(n):
    """フィボナッチ数列を生成する関数"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# リスト内包表記
squares = [x**2 for x in range(10)]
print(squares)

# クラス定義
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        return f"Hello, my name is {self.name} and I'm {self.age} years old."

person = Person("Bob", 25)
print(person.greet())
```

## CSS

```css
/* レスポンシブデザイン */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
}

/* フレックスボックス */
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}
```

## HTML

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>シンタックスハイライトテスト</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <header class="header">
      <nav class="navigation">
        <ul>
          <li><a href="#home">ホーム</a></li>
          <li><a href="#about">アバウト</a></li>
          <li><a href="#contact">コンタクト</a></li>
        </ul>
      </nav>
    </header>

    <main class="main-content">
      <section class="hero">
        <h1>Welcome to Our Website</h1>
        <p>This is a sample HTML document.</p>
        <button class="cta-button" onclick="showMessage()">Click Me</button>
      </section>
    </main>

    <script src="script.js"></script>
  </body>
</html>
```

## JSON

```json
{
  "name": "theorem-note",
  "version": "1.0.0",
  "description": "マークダウンエディタ",
  "main": "out/main/index.js",
  "scripts": {
    "build": "electron-vite build",
    "dev": "electron-vite dev",
    "preview": "electron-vite preview"
  },
  "dependencies": {
    "@electron-toolkit/preload": "^3.0.1",
    "@electron-toolkit/utils": "^4.0.0",
    "highlight.js": "^11.11.1",
    "marked": "^15.0.12"
  },
  "devDependencies": {
    "@codemirror/basic-setup": "^0.20.0",
    "@codemirror/lang-markdown": "^6.3.2",
    "@codemirror/theme-one-dark": "^6.1.2",
    "@types/node": "^22.14.1",
    "electron": "^35.1.5",
    "typescript": "^5.7.3",
    "vite": "^6.3.2"
  }
}
```

## Bash

```bash
#!/bin/bash

# ファイルとディレクトリの操作
echo "Starting deployment process..."

# 変数定義
PROJECT_DIR="/home/user/projects/theorem-note"
BUILD_DIR="$PROJECT_DIR/dist"
BACKUP_DIR="/backup/$(date +%Y%m%d_%H%M%S)"

# バックアップを作成
if [ -d "$BUILD_DIR" ]; then
    echo "Creating backup..."
    mkdir -p "$BACKUP_DIR"
    cp -r "$BUILD_DIR" "$BACKUP_DIR/"
fi

# ビルドプロセス
cd "$PROJECT_DIR" || exit 1
npm install
npm run build

# デプロイメント完了メッセージ
if [ $? -eq 0 ]; then
    echo "Deployment completed successfully!"
else
    echo "Deployment failed!"
    exit 1
fi
```

このファイルには様々なプログラミング言語のコードブロックが含まれており、シンタックスハイライトの動作を確認できます。
