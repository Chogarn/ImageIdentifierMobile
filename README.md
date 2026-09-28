# ImageIdentifier

App para identificar plantas y animales a partir de una foto, usando IA generativa (Gemini). Empezó como un ejercicio de aprendizaje: primero se construyó como app web, y esa misma base se está portando a una app mobile (Expo / React Native), que es el objetivo real del proyecto.

## Estructura del repo

```
backend/    NestJS + TypeORM + Postgres + JWT + Gemini AI
frontend/   Next.js (versión web, referencia / paso intermedio de aprendizaje)
mobile/     Expo + React Native (objetivo real del proyecto)
```

Las tres partes comparten el mismo backend.

## Cómo levantar todo en local

### 1. Backend

Requiere Docker (para Postgres) y Node.

```bash
cd backend
docker-compose up -d       # levanta Postgres
npm install
npm run start:dev          # NestJS en http://localhost:3001
```

Variables de entorno (`backend/.env`, no versionado):

```
PORT=3001
DB_HOST=localhost
DB_PORT=5433                # ver nota de puerto en AGENTS.md
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=image_identifier_mobile
JWT_SECRET=<tu secreto>
GEMINI_API_KEY=<tu api key>
GEMINI_DAILY_LIMIT=800      # techo diario de llamadas a Gemini (cuidar el free tier)
GEMINI_RPM_LIMIT=8          # techo por minuto de llamadas a Gemini
```

### 2. Frontend (web)

```bash
cd frontend
npm install
npm run dev                 # http://localhost:3000 (o el próximo puerto libre)
```

`frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Mobile (Expo)

```bash
cd mobile
npm install
npx expo start
```

`mobile/src/config/constants.ts` tiene la URL del backend hardcodeada (`10.0.2.2:3001` para emulador Android). Ajustarla si se prueba en iOS o dispositivo físico.

## Funcionalidad

- Registro / login con JWT.
- Identificación de plantas/animales por foto (cámara o galería en mobile, cámara del navegador en web), analizada por Gemini.
- Historial de identificaciones, filtrable por tipo (planta/animal).

## Estado actual

- Auth (registro, login) y el flujo de identificación funcionan de punta a punta en las 3 partes.
- Backend tiene guardas de seguridad y límites anti-costo para no exceder el free tier de Gemini (ver `backend/AGENTS.md` o el `AGENTS.md` raíz).
- El foco de desarrollo activo es `mobile/`.
