import { formatCurrency } from "@/lib/utils";

export function RecentTransactions({ items }: { items: Array<{ id: string; name: string; category: string; amount: number; type: string; date: Date }> }) {
  return (
    <div className="card p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Movimientos recientes</h2>
        <p className="text-sm text-slate-500">Tus últimas transacciones registradas manualmente.</p>
      </div>
      <div className="space-y-4">
        {items.slice(0, 6).map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-slate-500">{item.category} · {new Date(item.date).toLocaleDateString("es-ES")}</p>
            </div>
            <p className={`font-semibold ${item.type === "income" ? "text-emerald-600" : "text-slate-900"}`}>
              {item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
