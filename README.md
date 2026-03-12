# SmartBudget v5

Aplicación SaaS de finanzas personales con autenticación, dashboard privado, transacciones, presupuestos, suscripciones, metas, alertas automáticas y proyección de gastos futuros.

## Stack

- Next.js App Router
- Prisma ORM
- PostgreSQL en Neon
- Tailwind CSS
- Recharts

## Variables de entorno

Crea un archivo `.env` usando `.env.example`.

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="un-secreto-largo"
DEMO_USER_EMAIL="demo@smartbudget.app"
DEMO_USER_PASSWORD="demo12345"
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
3. Agrega las variables `DATABASE_URL`, `AUTH_SECRET`, `DEMO_USER_EMAIL` y `DEMO_USER_PASSWORD`.
4. Usa el comando de build por defecto del proyecto.
5. Verifica que Neon permita conexiones desde Vercel con la misma `DATABASE_URL`.

## Notas

- Toda la información se guarda por usuario.
- Prisma está configurado para PostgreSQL y funciona bien con Neon.
- No requiere almacenamiento local del servidor, así que está preparado para un entorno serverless.
