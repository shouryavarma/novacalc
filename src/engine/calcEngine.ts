import { create, all, MathJsInstance } from 'mathjs';

const math: MathJsInstance = create(all, { number: 'number', precision: 15 });

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

/**
 * Convert display expression symbols → mathjs-evaluable string.
 */
export function displayToMath(expr: string, angleMode: AngleMode): string {
  let s = expr;

  // 1. Replace visual math symbols
  s = s
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/×/g, ' * ')
    .replace(/÷/g, ' / ')
    .replace(/−/g, ' - ')
    .replace(/(\d)\s*Mod\s*/gi, '$1 % ')
    .replace(/\bMod\b/gi, ' % ')
    .replace(/π/g, ' pi ')
    .replace(/(\d)E([+-]?\d)/g, '$1e$2')   // scientific 5E3 → 5e3
    .replace(/∛\s*\(/g, 'nthRoot(')
    .replace(/∛(\d+\.?\d*)/g, (_, n) => `nthRoot(${n},3)`)
    .replace(/√\s*\(/g, 'sqrt(')
    .replace(/√(\d+\.?\d*)/g, (_, n) => `sqrt(${n})`)
    .replace(/ʸ√x/g, 'nthRoot')
    .replace(/sin⁻¹/g, 'asin')
    .replace(/cos⁻¹/g, 'acos')
    .replace(/tan⁻¹/g, 'atan')
    .replace(/\|/g, ' abs(');

  s = s.replace(/\s+/g, ' ').trim();

  // 2. Auto-close unclosed parentheses
  const openP = (s.match(/\(/g) || []).length;
  const closeP = (s.match(/\)/g) || []).length;
  for (let i = 0; i < openP - closeP; i++) s += ')';

  // 3. Factorial: 5! → factorial(5)
  s = s.replace(/(\d+)!/g, (_, n) => `factorial(${n})`);

  // 4. mathjs: log() is natural log, use log10() for base 10
  //    ln() is not built-in, use log() for natural log
  //    Use negative lookahead to avoid matching "log10" etc.
  s = s.replace(/\blog(?!\d)\s*\(/gi, 'log10(');
  s = s.replace(/\bln\s*\(/gi, 'log(');

  // 5. Degree mode: wrap forward trig arguments with "deg"
  //    Inverse trig: multiply result by 180/pi to convert rad→deg
  if (angleMode === 'deg') {
    // Forward trig: sin(x) → sin(x deg)
    const fwd = ['sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh'];
    for (const fn of fwd) {
      const re = new RegExp(`\\b${fn}\\(([^)]+)\\)(?!\\s*deg)`, 'g');
      s = s.replace(re, (m, a) => a.trim().endsWith('deg') ? m : `${fn}(${a} deg)`);
    }

    // Inverse trig: asin(x) → (asin(x) * 180 / pi)
    // We use a two-step: first evaluate asin in rad, then multiply by 180/pi
    const inv = ['asin', 'acos', 'atan'];
    for (const fn of inv) {
      // Only replace if not already wrapped
      const re = new RegExp(`\\b${fn}\\(([^)]+)\\)(?!\\s*\\*\\s*180\\s*/\\s*pi)`, 'g');
      s = s.replace(re, (m, a) => `(${fn}(${a}) * 180 / pi)`);
    }
  }

  return s;
}

/**
 * Evaluate display expression → numeric result.
 */
export function evaluate(expr: string, angleMode: AngleMode): { value: number; error?: string } {
  try {
    if (!expr || expr.trim() === '0' || expr.trim() === '') {
      return { value: 0 };
    }
    const mathExpr = displayToMath(expr, angleMode);
    let result: any;

    try {
      result = math.evaluate(mathExpr);
    } catch (innerErr: any) {
      // Fallback: try without deg wrapping
      if (angleMode === 'deg') {
        try {
          result = math.evaluate(displayToMath(expr, 'rad'));
        } catch {
          throw innerErr;
        }
      } else {
        throw innerErr;
      }
    }

    if (typeof result !== 'number') {
      if (result?.toNumber) result = result.toNumber();
      else throw new Error('Non-numeric');
    }
    return { value: result };
  } catch (e: any) {
    return { value: NaN, error: e.message || 'Error' };
  }
}

/**
 * Quick preview — returns "= 42" or "".
 */
export function preview(expr: string, angleMode: AngleMode): string {
  try {
    if (!expr || expr === '0' || expr.trim() === '') return '';
    const r = math.evaluate(displayToMath(expr, angleMode));
    const v = typeof r === 'number' ? r : (r?.toNumber?.() ?? NaN);
    if (isFinite(v)) return '= ' + formatNumber(v);
    return '';
  } catch { return ''; }
}

export function formatNumber(n: number): string {
  if (isNaN(n)) return 'Error';
  if (!isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
  if (Math.abs(n) > 1e15 || (Math.abs(n) < 1e-10 && n !== 0))
    return n.toExponential().replace(/\.?0+e/i, 'e').replace(/e\+/, 'e');
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  return String(parseFloat(n.toPrecision(12)));
}

/** Manual trig helpers (backup for when mathjs deg-mode fails) */
export function trigFn(name: string, value: number, angleMode: AngleMode): number {
  const rad = angleMode === 'deg' ? value * Math.PI / 180 : value;
  switch (name) {
    case 'sin': return Math.sin(rad);
    case 'cos': return Math.cos(rad);
    case 'tan': return Math.tan(rad);
    case 'sinh': return Math.sinh(value);
    case 'cosh': return Math.cosh(value);
    case 'tanh': return Math.tanh(value);
    default: return 0;
  }
}

export function invTrigFn(name: string, value: number, angleMode: AngleMode): number {
  let r: number;
  switch (name) {
    case 'asin': r = Math.asin(value); break;
    case 'acos': r = Math.acos(value); break;
    case 'atan': r = Math.atan(value); break;
    default: return 0;
  }
  return angleMode === 'deg' ? r * 180 / Math.PI : r;
}
