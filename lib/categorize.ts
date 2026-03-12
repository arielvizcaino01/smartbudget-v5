const CATEGORY_RULES: Array<{ category: string; keywords: string[] }> = [
  { category: 'Vivienda', keywords: ['rent', 'lease', 'landlord', 'mortgage', 'apartment', 'housing'] },
  { category: 'Comida', keywords: ['restaurant', 'burger', 'pizza', 'cafe', 'coffee', 'starbucks', 'doordash', 'uber eats', 'groceries', 'market', 'supermarket', 'walmart', 'aldi', 'target'] },
  { category: 'Transporte', keywords: ['uber', 'lyft', 'gas', 'shell', 'exxon', 'chevron', 'tesla supercharger', 'parking', 'toll', 'septa', 'metro'] },
  { category: 'Salud', keywords: ['pharmacy', 'cvs', 'walgreens', 'doctor', 'hospital', 'clinic', 'dentist', 'therapy'] },
  { category: 'Entretenimiento', keywords: ['netflix', 'spotify', 'disney', 'hulu', 'cinema', 'movie', 'playstation', 'xbox', 'steam'] },
  { category: 'Servicios', keywords: ['electric', 'water', 'internet', 'comcast', 'verizon', 'at&t', 't-mobile', 'utility', 'bill'] },
  { category: 'Educación', keywords: ['course', 'udemy', 'coursera', 'school', 'college', 'tuition', 'book'] },
  { category: 'Finanzas', keywords: ['bank fee', 'interest', 'brokerage', 'investment', 'dividend', 'trading', 'robinhood', 'fidelity'] },
  { category: 'Viajes', keywords: ['airbnb', 'hotel', 'flight', 'delta', 'american airlines', 'united', 'booking'] },
  { category: 'Trabajo', keywords: ['invoice', 'client', 'salary', 'payroll', 'gig', 'spark', 'uber payout', 'doordash payout'] }
];

export function suggestCategory(input: { name?: string | null; merchant?: string | null; notes?: string | null; type?: string | null }) {
  if (input.type === 'income') return 'Ingresos';

  const haystack = [input.name, input.merchant, input.notes]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.category;
    }
  }

  return 'General';
}
