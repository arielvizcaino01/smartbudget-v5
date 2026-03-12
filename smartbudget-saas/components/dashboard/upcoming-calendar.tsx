import { formatCurrency } from "@/lib/utils";

export function UpcomingCalendar({ items }: { items: Array<{ id: string; title: string; kind: string; amount: number; date: Date }> }) {
  return (
    <div className="card p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Calendario de próximos cargos</h2>
        <p className="text-sm text-slate-500">Tus próximas renovaciones y pagos en una sola vista.</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="font-medium text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-500">{item.kind} · {new Date(item.date).toLocaleDateString("es-ES")}</p>
            </div>
            <p className="font-semibold">{formatCurrency(item.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
