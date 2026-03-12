import Link from 'next/link';
import { DashboardPeriod } from '@/lib/dashboard';

const options: Array<{ value: DashboardPeriod; label: string }> = [
  { value: 'day', label: 'Diario' },
  { value: 'week', label: 'Semanal' },
  { value: 'month', label: 'Mensual' },
  { value: 'year', label: 'Anual' }
];

export function PeriodSwitcher({ current }: { current: DashboardPeriod }) {
  return (
    <div className="inline-flex w-full flex-wrap gap-2 rounded-3xl bg-slate-100 p-2 sm:w-auto">
      {options.map((option) => {
        const active = current === option.value;
        return (
          <Link
            key={option.value}
            href={`/dashboard?period=${option.value}`}
            className={`flex-1 rounded-2xl px-4 py-2 text-center text-sm font-medium transition sm:flex-none ${active ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
