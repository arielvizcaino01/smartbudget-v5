# SmartBudget v6

Aplicación de finanzas personales con autenticación, panel privado, movimientos, presupuestos, suscripciones, pagos recurrentes y objetivos de ahorro.

## Requisitos

- Node.js 20+
- Base de datos PostgreSQL en Neon

## Variables de entorno

Crea un archivo `.env` a partir de `.env.example` y completa:

```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
AUTH_SECRET="un-secreto-largo-y-aleatorio"
DEFAULT_USER_EMAIL="owner@smartbudget.app"
DEFAULT_USER_PASSWORD="change-this-password"
DEFAULT_USER_NAME="Cuenta principal"
```

## Desarrollo local

```bash
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

## Despliegue en Vercel

1. Sube el proyecto a GitHub.
2. Importa el repositorio en Vercel.
3. Agrega `DATABASE_URL` y `AUTH_SECRET` en Environment Variables.
4. Ejecuta el deploy.

## Nota

La conexión a Neon debe ir siempre por variables de entorno. No incluyas credenciales reales dentro del código ni del repositorio.
