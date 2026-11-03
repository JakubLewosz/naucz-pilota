import type { Polynomial } from './types';
export class ExpressionError extends Error {
  constructor(public code: string) { super(messages[code] ?? 'Popraw zapis wzoru.'); }
}
const messages: Record<string, string> = {
  EMPTY_EXPRESSION: 'Wpisz wzór funkcji.', UNSUPPORTED_TOKEN: 'Użyj tylko x, liczb i dozwolonych działań.',
  SYNTAX_ERROR: 'Popraw zapis wzoru i nawiasy.', UNSUPPORTED_EXPONENT: 'Wykładnik musi być cyfrą 0, 1 lub 2.',
  DEGREE_LIMIT: 'W tej wersji możesz użyć funkcji do stopnia 2.', NON_CONSTANT_DIVISOR: 'Możesz dzielić wyłącznie przez liczbę.',
  DIVISION_BY_ZERO: 'Nie można dzielić przez zero.', UNDEFINED_POWER: 'Wyrażenie 0^0 jest nieokreślone.',
  COEFFICIENT_LIMIT: 'Współczynniki pośrednie nie mogą przekraczać 10000.', COEFFICIENT_UNDERFLOW: 'Współczynnik jest zbyt mały do obliczeń.',
  EXPRESSION_TOO_COMPLEX: 'Wzór jest zbyt złożony. Użyj krótszego zapisu.'
};
const fail = (code: string): never => { throw new ExpressionError(code); };
type Q = [bigint, bigint];
const gcd = (a: bigint, b: bigint): bigint => { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a; };
function q(n: bigint, d = 1n): Q {
  if (!d) return fail('DIVISION_BY_ZERO');
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d); n /= g; d /= g;
  if (n.toString(2).replace('-', '').length > 2048 || d.toString(2).length > 2048) fail('EXPRESSION_TOO_COMPLEX');
  return [n, d];
}
const add = (a: Q, b: Q) => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const mul = (a: Q, b: Q) => q(a[0] * b[0], a[1] * b[1]);
type P = Q[];
export type AST = { kind: string; value?: string; children: AST[] };
type Node = { p: P; ast: AST; depth: number };
function check(p: P): P {
  while (p.length > 1 && p.at(-1)![0] === 0n) p.pop();
  if (p.length > 3) fail('DEGREE_LIMIT');
  for (const [n, d] of p) if ((n < 0n ? -n : n) > 10000n * d) fail('COEFFICIENT_LIMIT');
  return p;
}
function multiply(a: P, b: P): P {
  const out: P = Array.from({ length: a.length + b.length - 1 }, () => [0n, 1n]);
  a.forEach((v, i) => b.forEach((w, j) => { out[i+j] = add(out[i+j], mul(v,w)); }));
  return check(out);
}
export function parseExpression(input: string): { ast: AST; coefficients: Polynomial; family: 'constant' | 'linear' | 'quadratic' } {
  if ([...input].length > 120) fail('EXPRESSION_TOO_COMPLEX');
  const source = input.trim().replace(/−/g, '-').replace(/×/g, '*').replace(/²/g, '^2').replace(/(?<=\d),(?=\d)/g, '.').replace(/^(?:y\s*=|f\s*\(\s*x\s*\)\s*=)\s*/, '');
  if (!source) fail('EMPTY_EXPRESSION');
  const tokens: string[] = [];
  let pos = 0;
  while (pos < source.length) {
    if (/\s/.test(source[pos])) { pos++; continue; }
    const match = /^(?:\d+(?:\.\d*)?|\.\d+|x|[+\-*/^()])/.exec(source.slice(pos));
    if (!match) fail('UNSUPPORTED_TOKEN');
    tokens.push(match![0]); pos += match![0].length;
  }
  let at = 0, nodes = 0, nesting = 0;
  const peek = () => tokens[at];
  const node = (kind: string, p: P, children: Node[] = [], value?: string): Node => {
    const depth = 1 + Math.max(0, ...children.map(c => c.depth));
    if (++nodes > 64 || depth > 16) fail('EXPRESSION_TOO_COMPLEX');
    return { p: check(p), ast: { kind, value, children: children.map(c => c.ast) }, depth };
  };
  function atom(): Node {
    const t = tokens[at++];
    if (t === 'x') return node('x', [[0n,1n],[1n,1n]]);
    if (t === '(') {
      if (++nesting > 16) fail('EXPRESSION_TOO_COMPLEX');
      const n = sum();
      if (tokens[at++] !== ')') fail('SYNTAX_ERROR');
      nesting--; return n;
    }
    if (t && /^(?:\d|\.)/.test(t)) {
      const [whole, fraction = ''] = t.split('.');
      return node('number', [q(BigInt((whole || '0') + fraction), 10n ** BigInt(fraction.length))], [], t);
    }
    return fail('SYNTAX_ERROR');
  }
  function power(): Node {
    let n = atom();
    if (peek() === '^') {
      at++; const exponent = tokens[at++];
      if (!['0','1','2'].includes(exponent)) fail('UNSUPPORTED_EXPONENT');
      const exp = node('number', [q(BigInt(exponent))], [], exponent);
      if (exponent === '0' && n.p.every(v => v[0] === 0n)) fail('UNDEFINED_POWER');
      n = node('power', exponent === '0' ? [[1n,1n]] : exponent === '1' ? n.p : multiply(n.p,n.p), [n,exp]);
      if (peek() === '^') fail('UNSUPPORTED_EXPONENT');
    }
    return n;
  }
  function unary(): Node {
    if (peek() === '+' || peek() === '-') {
      const op = tokens[at++];
      if (++nesting > 16) fail('EXPRESSION_TOO_COMPLEX');
      const n = unary(); nesting--;
      return node(op, n.p.map(([v,d]) => [op === '-' ? -v : v,d]), [n]);
    }
    return power();
  }
  function product(): Node {
    let n = unary();
    while (peek() === '*' || peek() === '/' || peek() === 'x' || peek() === '(') {
      const op = peek() === '*' || peek() === '/' ? tokens[at++] : '*';
      const right = unary(); let p: P;
      if (op === '/') {
        if (right.p.length !== 1) fail('NON_CONSTANT_DIVISOR');
        if (!right.p[0][0]) fail('DIVISION_BY_ZERO');
        p = n.p.map(v => mul(v, q(right.p[0][1],right.p[0][0])));
      } else p = multiply(n.p,right.p);
      n = node(op,p,[n,right]);
    }
    return n;
  }
  function sum(): Node {
    let n = product();
    while (peek() === '+' || peek() === '-') {
      const op = tokens[at++], right = product();
      const p: P = Array.from({length:Math.max(n.p.length,right.p.length)}, (_,i) => add(n.p[i] ?? [0n,1n], mul(right.p[i] ?? [0n,1n],[op === '-' ? -1n : 1n,1n])));
      n = node(op,p,[n,right]);
    }
    return n;
  }
  const result = sum();
  if (at !== tokens.length) fail('SYNTAX_ERROR');
  const numbers = result.p.map(([n,d]) => {
    const nb = (n < 0n ? -n : n).toString(2).length, db = d.toString(2).length;
    const ns = Math.max(0,nb-53), ds = Math.max(0,db-53);
    const value = Number(n >> BigInt(ns))/Number(d >> BigInt(ds))*2**(ns-ds);
    if (!Number.isFinite(value)) fail('COEFFICIENT_LIMIT');
    if (n !== 0n && value === 0) fail('COEFFICIENT_UNDERFLOW');
    return value;
  });
  return { ast: result.ast, coefficients: { c2:numbers[2] ?? 0,c1:numbers[1] ?? 0,c0:numbers[0] ?? 0 }, family: result.p.length === 3 ? 'quadratic' : result.p.length === 2 ? 'linear' : 'constant' };
}
