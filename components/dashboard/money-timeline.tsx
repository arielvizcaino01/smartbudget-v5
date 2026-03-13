import { ArrowDownRight, ArrowUpRight, CalendarClock, Repeat2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type TimelineItem = {
  id: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  amount?: number;
  tone: 'income' | 'expense' | 'upcoming';
};

function toneStyles(tone: TimelineItem['tone']) {
  if (tone === 'income') return 'bg-emerald-50 text-emerald-700';
  if (tone === 'expense') return 'bg-rose-50 text-rose-700';
  return 'bg-brand-50 text-brand-700';
}

function ToneIcon({ tone }: { tone: TimelineItem['tone'] }) {
  if (tone === 'income') return <ArrowUpRight className="h-4 w-4" />;
  if (tone === 'expense') return <ArrowDownRight className="h-4 w-4" />;
  return <Repeat2 className="h-4 w-4" />;
}

export function MoneyTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <CalendarClock className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">Timeline de dinero</h2>
          <p className="text-sm text-slate-500">Lo último que pasó y lo próximo que viene.</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white">
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneStyles(item.tone)}`}>
                  <ToneIcon tone={item.tone} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{item.dateLabel}</p>
                {typeof item.amount === 'number' ? (
                  <p className={`text-sm font-semibold ${item.tone === 'income' ? 'text-emerald-600' : item.tone === 'expense' ? 'text-slate-900' : 'text-brand-700'}`}>
                    {item.tone === 'income' ? '+' : item.tone === 'expense' ? '-' : ''}{formatCurrency(Math.abs(item.amount))}
                  </p>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            Aún no hay actividad suficiente para llenar tu timeline.
          </div>
        )}
      </div>
    </section>
  );
}
