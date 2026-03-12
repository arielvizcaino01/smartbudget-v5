import { formatCurrency } from "@/lib/utils";

export function SubscriptionList({ items }: { items: Array<{ id: string; name: string; category: string; monthlyCost: number; nextBillingDate: Date }> }) {
  return (
    <div className="card p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Suscripciones</h2>
        <p className="text-sm text-slate-500">Descubre qué pagos recurrentes tienes activos.</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-slate-500">{item.category} · próximo cobro {new Date(item.nextBillingDate).toLocaleDateString("es-ES")}</p>
            </div>
            <p className="font-semibold">{formatCurrency(item.monthlyCost)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
