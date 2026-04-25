# Руководство по развертыванию - LifeBalance SPb Frontend

## Содержание

1. [Требования](#требования)
2. [Локальная разработка](#локальная-разработка)
3. [Сборка для продакшена](#сборка-для-продакшена)
4. [Развертывание](#развертывание)
5. [Переменные окружения](#переменные-окружения)
6. [Мониторинг и логирование](#мониторинг-и-логирование)
7. [Troubleshooting](#troubleshooting)

---

## Требования

### Минимальные требования

- Node.js >= 18.0.0
- npm >= 9.0.0
- 2GB RAM
- 500MB свободного места на диске

### Рекомендуемые требования

- Node.js >= 20.0.0
- npm >= 10.0.0
- 4GB RAM
- 1GB свободного места на диске

### Проверка версий

```bash
node --version
npm --version
```

---

## Локальная разработка

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-org/lifebalance-spb.git
cd lifebalance-spb/frontend
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Создайте файл `.env.local` в корне frontend директории:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=LifeBalance SPb
VITE_APP_VERSION=1.0.0
```

### 4. Запуск dev сервера

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

### 5. Запуск с backend

Используйте PowerShell скрипт для одновременного запуска frontend и backend:

```powershell
# Из корня проекта
.\start-services.ps1
```

---

## Сборка для продакшена

### 1. Проверка кода

```bash
# Линтинг
npm run lint

# Исправление автоматических ошибок
npm run lint -- --fix

# Проверка типов TypeScript
npx tsc --noEmit
```

### 2. Запуск тестов

```bash
# Все тесты
npm test

# Конкретный тест
npm test auth.spec.ts

# С отчетом
npm run test:report
```

### 3. Сборка

```bash
npm run build
```

Результат сборки будет в папке `dist/`

### 4. Превью продакшен сборки

```bash
npm run preview
```

### 5. Анализ размера бандла

```bash
npm run build -- --mode analyze
```

---

## Развертывание

### Vercel (Рекомендуется)

#### Через CLI

```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
vercel

# Продакшен деплой
vercel --prod
```

#### Через GitHub Integration

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Vercel автоматически деплоит при push в main

**Настройки проекта:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### Netlify

#### Через CLI

```bash
# Установка Netlify CLI
npm i -g netlify-cli

# Деплой
netlify deploy

# Продакшен деплой
netlify deploy --prod
```

#### Через UI

1. Подключите репозиторий
2. Build command: `npm run build`
3. Publish directory: `dist`

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Docker

#### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### Сборка и запуск

```bash
# Сборка образа
docker build -t lifebalance-frontend .

# Запуск контейнера
docker run -p 80:80 lifebalance-frontend
```

#### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/lifebalance
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=lifebalance
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### GitHub Pages

**Не рекомендуется** для этого проекта, так как требуется backend API.

---

## Переменные окружения

### Разработка (.env.local)

```env
# API URL
VITE_API_URL=http://localhost:8000

# App Info
VITE_APP_NAME=LifeBalance SPb
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false
```

### Продакшен (.env.production)

```env
# API URL
VITE_API_URL=https://api.lifebalance-spb.ru

# App Info
VITE_APP_NAME=LifeBalance SPb
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Error Tracking
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Использование в коде

```typescript
// src/config.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  appName: import.meta.env.VITE_APP_NAME || 'LifeBalance SPb',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableErrorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
};
```

---

## Оптимизация производительности

### 1. Code Splitting

```typescript
// Lazy loading страниц
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MapPage = lazy(() => import('./pages/MapPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Оптимизация изображений

```bash
# Установка плагина
npm install vite-plugin-imagemin -D
```

```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox' },
          { name: 'removeEmptyAttrs', active: false }
        ]
      }
    })
  ]
});
```

### 3. Кэширование

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', '@dnd-kit/core'],
          'utils-vendor': ['axios', 'zustand', '@tanstack/react-query'],
        }
      }
    }
  }
});
```

### 4. Compression

```bash
npm install vite-plugin-compression -D
```

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    })
  ]
});
```

---

## Мониторинг и логирование

### Sentry Integration

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true') {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

### Google Analytics

```bash
npm install react-ga4
```

```typescript
// src/analytics.ts
import ReactGA from 'react-ga4';

export const initGA = () => {
  if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
    ReactGA.initialize(import.meta.env.VITE_GA_TRACKING_ID);
  }
};

export const logPageView = () => {
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
};

export const logEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({ category, action, label });
};
```

### Custom Logger

```typescript
// src/utils/logger.ts
type LogLevel = 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  log(level: LogLevel, message: string, data?: any) {
    if (this.isDevelopment) {
      console[level](message, data);
    }

    // Отправка в внешний сервис
    if (level === 'error' && import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true') {
      // Sentry.captureException(new Error(message));
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }
}

export const logger = new Logger();
```

---

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run linter
        working-directory: ./frontend
        run: npm run lint
      
      - name: Run tests
        working-directory: ./frontend
        run: npm test
      
      - name: Build
        working-directory: ./frontend
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install Vercel CLI
        run: npm install -g vercel
      
      - name: Deploy to Vercel
        working-directory: ./frontend
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Troubleshooting

### Проблема: Ошибка при установке зависимостей

**Решение:**
```bash
# Очистка кэша npm
npm cache clean --force

# Удаление node_modules и package-lock.json
rm -rf node_modules package-lock.json

# Переустановка
npm install
```

### Проблема: Ошибки TypeScript при сборке

**Решение:**
```bash
# Проверка типов
npx tsc --noEmit

# Обновление типов
npm update @types/react @types/react-dom
```

### Проблема: CORS ошибки

**Решение:**

1. Настройте прокси в vite.config.ts:
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});
```

2. Или настройте CORS на backend

### Проблема: Медленная сборка

**Решение:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: false, // Отключить sourcemaps
    minify: 'esbuild', // Использовать esbuild
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // Предварительная оптимизация
  }
});
```

### Проблема: Большой размер бандла

**Решение:**
```bash
# Анализ бандла
npm run build -- --mode analyze

# Проверка дублирующихся зависимостей
npx depcheck

# Удаление неиспользуемых зависимостей
npm prune
```

---

## Чеклист деплоя

### Перед деплоем

- [ ] Все тесты проходят
- [ ] Линтер не выдает ошибок
- [ ] TypeScript компилируется без ошибок
- [ ] Проверена работа на разных браузерах
- [ ] Проверена мобильная версия
- [ ] Оптимизированы изображения
- [ ] Настроены переменные окружения
- [ ] Обновлена документация
- [ ] Создан git tag с версией

### После деплоя

- [ ] Проверена работа на продакшене
- [ ] Проверены все основные функции
- [ ] Настроен мониторинг ошибок
- [ ] Настроена аналитика
- [ ] Проверены метрики производительности
- [ ] Создан backup
- [ ] Уведомлена команда

---

## Метрики производительности

### Целевые показатели

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Total Blocking Time (TBT)**: < 200ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Инструменты измерения

- Lighthouse (встроен в Chrome DevTools)
- WebPageTest
- Google PageSpeed Insights
- Vercel Analytics

### Команда для проверки

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:5173
```

---

## Безопасность

### Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               font-src 'self' data:;">
```

### Security Headers (nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

### Аудит безопасности

```bash
# Проверка уязвимостей
npm audit

# Автоматическое исправление
npm audit fix

# Проверка лицензий
npx license-checker
```

---

## Поддержка

### Документация
- Frontend Docs: `/docs/FRONTEND_DOCS.md`
- Components Reference: `/docs/COMPONENTS_REFERENCE.md`
- API Documentation: Backend `/docs/api.md`

### Контакты
- GitHub Issues: https://github.com/your-org/lifebalance-spb/issues
- Email: support@lifebalance-spb.ru

### Полезные ссылки
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
