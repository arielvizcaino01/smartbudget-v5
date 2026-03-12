import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

export function BudgetList({ items }: { items: Array<{ category: string; spent: number; limit: number; progress: number }> }) {
  return (
    <div className="card p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Presupuestos</h2>
        <p className="text-sm text-slate-500">Monitorea cuánto llevas consumido en cada categoría.</p>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.category}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">{item.category}</span>
              <span className="text-slate-500">{formatCurrency(item.spent)} / {formatCurrency(item.limit)}</span>
            </div>
            <Progress value={item.progress} />
          </div>
        ))}
      </div>
    </div>
  );
}
