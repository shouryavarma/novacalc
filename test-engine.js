// Engine test suite — same logic as calcEngine.ts
const { create, all, pi } = require('mathjs');
const math = create(all, { number: 'number', precision: 15 });

function displayToMath(expr, angleMode) {
  let s = expr;
  s = s.replace(/²/g, '^2').replace(/³/g, '^3')
    .replace(/×/g, ' * ').replace(/÷/g, ' / ').replace(/−/g, ' - ')
    .replace(/(\d)\s*Mod\s*/gi, '$1 % ').replace(/\bMod\b/gi, ' % ')
    .replace(/π/g, ' pi ')
    .replace(/(\d)E([+-]?\d)/g, '$1e$2')
    .replace(/∛\s*\(/g, 'nthRoot(')
    .replace(/∛(\d+\.?\d*)/g, (_, n) => `nthRoot(${n},3)`)
    .replace(/√\s*\(/g, 'sqrt(')
    .replace(/√(\d+\.?\d*)/g, (_, n) => `sqrt(${n})`)
    .replace(/ʸ√x/g, 'nthRoot')
    .replace(/sin⁻¹/g, 'asin').replace(/cos⁻¹/g, 'acos').replace(/tan⁻¹/g, 'atan')
    .replace(/\|/g, ' abs(');
  s = s.replace(/\s+/g, ' ').trim();

  // Close parens
  const o = (s.match(/\(/g) || []).length, c = (s.match(/\)/g) || []).length;
  for (let i = 0; i < o - c; i++) s += ')';

  // Factorial
  s = s.replace(/(\d+)!/g, (_, n) => `factorial(${n})`);

  // log → log10 (mathjs log is natural log); ln → log (natural)
  s = s.replace(/\blog(?!\d)\s*\(/gi, 'log10(');
  s = s.replace(/\bln\s*\(/gi, 'log(');

  // Degree mode
  if (angleMode === 'deg') {
    const fwd = ['sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh'];
    for (const fn of fwd) {
      const re = new RegExp(`\\b${fn}\\(([^)]+)\\)(?!\\s*deg)`, 'g');
      s = s.replace(re, (m, a) => a.trim().endsWith('deg') ? m : `${fn}(${a} deg)`);
    }
    const inv = ['asin', 'acos', 'atan'];
    for (const fn of inv) {
      const re = new RegExp(`\\b${fn}\\(([^)]+)\\)(?!\\s*\\*\\s*180\\s*/\\s*pi)`, 'g');
      s = s.replace(re, (m, a) => `(${fn}(${a}) * 180 / pi)`);
    }
  }
  return s;
}

function evaluate(expr, angleMode = 'deg') {
  try {
    const mathExpr = displayToMath(expr, angleMode);
    let result;
    try { result = math.evaluate(mathExpr); }
    catch (e) {
      if (angleMode === 'deg') {
        try { result = math.evaluate(displayToMath(expr, 'rad')); }
        catch { throw e; }
      } else throw e;
    }
    if (typeof result !== 'number') { if (result?.toNumber) result = result.toNumber(); else throw Error('Non-numeric'); }
    return { value: result, mathExpr };
  } catch (e) { return { error: e.message, mathExpr: displayToMath(expr, angleMode) }; }
}

function fmt(n) {
  if (!isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
  if (Math.abs(n) > 1e15 || (Math.abs(n) < 1e-10 && n !== 0)) return n.toExponential().replace(/\.?0+e/i, 'e').replace(/e\+/, 'e');
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  return String(parseFloat(n.toPrecision(12)));
}

function test(expr, expected, mode = 'deg') {
  const r = evaluate(expr, mode);
  const pass = !r.error && Math.abs(r.value - expected) < 1e-10;
  const s = pass ? '✅' : '❌';
  console.log(`${s} ${expr} → ${r.error || fmt(r.value)} (expect ${expected})`);
  if (!pass && r.mathExpr) console.log(`   → ${r.mathExpr}`);
  return pass;
}

let pass = 0, fail = 0;
function t(expr, exp, mode = 'deg') { test(expr, exp, mode) ? pass++ : fail++; }

console.log('\n=== BODMAS / PEMDAS ===\n');
t('3 + 4 × 2', 11);
t('10 − 3 + 2', 9);
t('20 ÷ 4 × 2', 10);
t('(3 + 4) × 2', 14);

console.log('\n=== TRIG (deg) ===\n');
t('sin(30)', 0.5);
t('cos(60)', 0.5);
t('tan(45)', 1);
t('sin(0)', 0);
t('cos(0)', 1);
t('sin(90)', 1);
t('sin(30)^2 + cos(30)^2', 1);

console.log('\n=== INVERSE TRIG (deg) ===\n');
t('asin(0.5)', 30);
t('acos(0.5)', 60);
t('atan(1)', 45);

console.log('\n=== LOG (base 10) ===\n');
t('log(100)', 2);
t('log(1000)', 3);
t('log(1)', 0);
t('log(10)', 1);

console.log('\n=== NATURAL LOG ===\n');
t('ln(1)', 0);
t('ln(e)', 1);

console.log('\n=== POWERS & ROOTS ===\n');
t('sqrt(144)', 12);
t('sqrt(25)', 5);
t('2^10', 1024);
t('5E3', 5000);

console.log('\n=== FACTORIAL ===\n');
t('factorial(5)', 120);
t('factorial(0)', 1);

console.log('\n=== MOD ===\n');
t('10 % 3', 1);
t('25 % 7', 4);

console.log('\n=== CONSTANTS ===\n');
t('pi', Math.PI);
t('e', Math.E);

console.log('\n=== GATE / PSU EXAMPLES ===\n');
t('25 + 75 ÷ 5', 40);
t('(25 + 75) ÷ 5', 20);
t('sqrt(25) + sqrt(16)', 9);
t('3! + 2!', 8);
t('1/4 + 1/2', 0.75);
t('abs(−10)', 10);
t('2^5', 32);

console.log('\n=== ADDITIONAL GATE/PSU EDGE CASES ===\n');

// Exponentiation
t('2^3', 8);
t('10^0', 1);
t('10^1', 10);
t('10^2', 100);

// Fraction operations
t('1/3 + 2/3', 1);
t('1/2 + 1/4', 0.75);
t('1/8', 0.125);

// Decimal + fraction mix
t('0.75 + 1/4', 1);

// Parentheses
t('(2+3)*4', 20);
t('2+(3*4)', 14);
t('(2+3)*(4+5)', 45);

// Negation
t('0−5', -5);
t('−(5)', -5);
// Note: bare negation like "−5" is tricky in display, button inserts "−" prefix

// Mixed trig
t('sin(30) + cos(60)', 1);
t('sin(45)^2', 0.5);
t('cos(45)^2', 0.5);

// Memory operations are UI-level, not engine-level — tested separately

// Chained operations
t('2+3+4+5', 14);
t('2*3*4', 24);
t('100/2/5', 10);

// Constants
t('2*pi', Math.PI * 2);
t('pi/2', Math.PI / 2);

// Modulo
t('2 % 2', 0);
t('17 % 5', 2);
t('100 % 30', 10);

// Scientific notation edge cases
t('1E0', 1);
t('1E1', 10);
t('1.5E2', 150);

console.log(`\n${'='.repeat(40)}`);
console.log(`Pass: ${pass}  Fail: ${fail}  (${pass+fail} total)`);
console.log(`${'='.repeat(40)}`);
process.exit(fail > 0 ? 1 : 0);
