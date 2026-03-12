import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

export function GoalsList({ items }: { items: Array<{ id: string; name: string; targetAmount: number; currentAmount: number; targetDate: Date }> }) {
  return (
    <div className="card p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Metas</h2>
        <p className="text-sm text-slate-500">Sigue el progreso de tus objetivos de ahorro.</p>
      </div>
      <div className="space-y-4">
        {items.map((item) => {
          const progress = Math.min((item.currentAmount / item.targetAmount) * 100, 100);
          return (
            <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-slate-500">{new Date(item.targetDate).toLocaleDateString("es-ES")}</p>
              </div>
              <div className="mb-2 text-sm text-slate-500">{formatCurrency(item.currentAmount)} de {formatCurrency(item.targetAmount)}</div>
              <Progress value={progress} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
