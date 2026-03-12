export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="card p-8">
        <p className="badge mb-3">Sin conexión</p>
        <h1 className="text-2xl font-semibold text-slate-950">No hay internet en este momento</h1>
        <p className="mt-3 text-sm text-slate-500">
          Puedes volver a intentarlo cuando recuperes la conexión. Si instalaste la app, algunas vistas recientes seguirán disponibles.
        </p>
      </div>
    </main>
  );
}
