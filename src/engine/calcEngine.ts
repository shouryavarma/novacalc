import { create, all, MathJsInstance } from 'mathjs';

const math: MathJsInstance = create(all, {
  number: 'number',
  precision: 15,
});

export type AngleMode = 'deg' | 'rad';

export interface CalcState {
  display: string;
  result: string;
  memory: number;
  hasMemory: boolean;
  angleMode: AngleMode;
  is2nd: boolean;
  lastAnswer: number | null;
  history: HistoryEntry[];
  error: boolean;
}

export interface HistoryEntry {
  expr: string;
  result: string;
  time: string;
  id: number;
}

export function evaluate(expr: string, angleMode: AngleMode): { value: number; error?: string } {
  try {
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'pi')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/∛/g, '^(1/3)')
      .replace(/ʸ√x/g, '^(1/')
      .replace(/Mod/g, '%')
      .replace(/sin⁻¹/g, 'asin')
      .replace(/cos⁻¹/g, 'acos')
      .replace(/tan⁻¹/g, 'atan')
      .replace(/\|/g, 'abs(');

    // Close open parentheses for abs
    const openP = (sanitized.match(/\(/g) || []).length;
    const closeP = (sanitized.match(/\)/g) || []).length;
    const absCount = (sanitized.match(/abs\(/g) || []).length;
    const neededClose = openP - closeP + absCount;
    for (let i = 0; i < neededClose; i++) sanitized += ')';

    // Auto-close unclosed parens
    const finalOpen = (sanitized.match(/\(/g) || []).length;
    const finalClose = (sanitized.match(/\)/g) || []).length;
    for (let i = 0; i < finalOpen - finalClose; i++) sanitized += ')';

    // Handle factorial
    sanitized = sanitized.replace(/(\d+)!/g, 'factorial($1)');

    // Set angle mode
    if (angleMode === 'deg') {
      math.config({ number: 'number' });
    }

    const result = math.evaluate(sanitized);
    if (typeof result !== 'number') throw new Error('Non-numeric result');
    if (!isFinite(result)) return { value: result };
    return { value: result };
  } catch (e: any) {
    return { value: NaN, error: e.message || 'Error' };
  }
}

export function formatNumber(n: number): string {
  if (isNaN(n)) return 'Error';
  if (!isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
  if (Math.abs(n) > 1e15 || (Math.abs(n) < 1e-10 && n !== 0)) {
    return n.toExponential(10).replace(/\.?0+e/, 'e');
  }
  return String(parseFloat(n.toPrecision(12)));
}

export function trigFn(name: string, value: number, angleMode: AngleMode): number {
  const rad = angleMode === 'deg' ? (value * Math.PI) / 180 : value;
  switch (name) {
    case 'sin': return Math.sin(rad);
    case 'cos': return Math.cos(rad);
    case 'tan': return Math.tan(rad);
    default: return 0;
  }
}

export function invTrigFn(name: string, value: number, angleMode: AngleMode): number {
  let result: number;
  switch (name) {
    case 'asin': result = Math.asin(value); break;
    case 'acos': result = Math.acos(value); break;
    case 'atan': result = Math.atan(value); break;
    default: return 0;
  }
  return angleMode === 'deg' ? (result * 180) / Math.PI : result;
}
