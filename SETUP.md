# Setup do Projeto - Ayni Frontend

## 📦 Instalação de Dependências

```bash
npm install --save-dev \
  @sentry/react \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-config-prettier \
  prettier \
  jest \
  ts-jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @types/jest \
  identity-obj-proxy \
  husky \
  lint-staged

npm install zod
```

## 🔧 Configurar Husky

```bash
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

## 🌐 Variáveis de Ambiente

Adicione ao `.env`:
```
VITE_SENTRY_DSN=your_sentry_dsn_here
```

## 📝 Scripts do Package.json

Adicione ao `package.json`:
```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## 🎯 Importar Sentry

No `src/main.tsx`, adicione no topo:
```typescript
import './sentry.config';
```
