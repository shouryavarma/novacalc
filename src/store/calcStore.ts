import { useState, useCallback } from 'react';
import { evaluate, formatNumber, CalcState, HistoryEntry, AngleMode } from '../engine/calcEngine';

const HISTORY_KEY = 'novacalc_history';
const SETTINGS_KEY = 'novacalc_settings';

interface Settings {
  largeDisplay: boolean;
  sound: boolean;
  autoSave: boolean;
  idleTimeout: number;
}

const defaultSettings: Settings = {
  largeDisplay: false,
  sound: true,
  autoSave: true,
  idleTimeout: 600,
};

export function useCalcStore() {
  const [display, setDisplay] = useState('0');
  const [result, setResult] = useState('');
  const [memory, setMemory] = useState(0);
  const [hasMemory, setHasMemory] = useState(false);
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');
  const [is2nd, setIs2nd] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [settings, setSettingsState] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch { return defaultSettings; }
  });

  // Undo/redo stacks
  const [undoStack, setUndoStack] = useState<{ display: string }[]>([]);
  const [redoStack, setRedoStack] = useState<{ display: string }[]>([]);

  const saveHistory = useCallback((h: HistoryEntry[]) => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 100))); } catch {}
  }, []);

  const saveSettings = useCallback((s: Settings) => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
  }, []);

  const pushUndo = useCallback((d: string) => {
    setUndoStack(prev => [...prev.slice(-20), { display: d }]);
    setRedoStack([]);
  }, []);

  const undo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setRedoStack(r => [...r, { display }]);
      setDisplay(last.display);
      return prev.slice(0, -1);
    });
  }, [display]);

  const redo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setUndoStack(u => [...u, { display }]);
      setDisplay(last.display);
      return prev.slice(0, -1);
    });
  }, [display]);

  const addToHistory = useCallback((expr: string, res: string) => {
    const entry: HistoryEntry = {
      expr,
      result: res,
      time: new Date().toLocaleString(),
      id: Date.now(),
    };
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 100);
      if (settings.autoSave) saveHistory(updated);
      return updated;
    });
  }, [settings.autoSave, saveHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, [saveHistory]);

  const evaluateDisplay = useCallback((d: string) => {
    const res = evaluate(d, angleMode);
    if (res.error || isNaN(res.value)) {
      setResult('Error');
      setError(true);
    } else {
      setResult(formatNumber(res.value));
      setError(false);
      setLastAnswer(res.value);
      addToHistory(d, formatNumber(res.value));
    }
  }, [angleMode, addToHistory]);

  const handleAction = useCallback((action: string) => {
    setError(false);
    const curDisp = display;

    const inputDigit = (d: string) => {
      const next = newEntry ? d : curDisp + d;
      pushUndo(curDisp);
      setDisplay(next);
      setNewEntry(false);
    };

    switch (action) {
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9':
        inputDigit(action);
        break;

      case 'decimal':
        if (newEntry) { pushUndo(curDisp); setDisplay('0.'); setNewEntry(false); }
        else if (!curDisp.includes('.')) { pushUndo(curDisp); setDisplay(curDisp + '.'); }
        break;

      case 'add': case 'subtract': case 'multiply': case 'divide': case 'mod':
        const sym = { add: '+', subtract: '−', multiply: '×', divide: '÷', mod: ' Mod ' }[action]!;
        if (!newEntry && pendingOp) {
          evaluateDisplay(curDisp);
          setPendingOp(sym);
          setDisplay(curDisp + ' ' + sym + ' ');
          setNewEntry(true);
        } else {
          pushUndo(curDisp);
          setPendingOp(sym);
          setDisplay(curDisp + ' ' + sym + ' ');
          setNewEntry(true);
        }
        break;

      case 'equals':
        if (newEntry && lastAnswer !== null && pendingOp) {
          const sym2 = pendingOp;
          const nextDisp = formatNumber(lastAnswer) + ' ' + sym2 + ' ';
          setDisplay(nextDisp);
          evaluateDisplay(nextDisp);
          setPendingOp(null);
        } else {
          evaluateDisplay(curDisp);
          setPendingOp(null);
          setNewEntry(true);
        }
        break;

      case 'clear':
        setDisplay('0');
        setResult('');
        setError(false);
        setPendingOp(null);
        setNewEntry(true);
        setUndoStack([]);
        setRedoStack([]);
        break;

      case 'ce':
        pushUndo(curDisp);
        setDisplay('0');
        setNewEntry(true);
        break;

      case 'bksp':
        if (curDisp.length > 1) { pushUndo(curDisp); setDisplay(curDisp.slice(0, -1)); }
        else { pushUndo(curDisp); setDisplay('0'); }
        break;

      case 'lparen': pushUndo(curDisp); setDisplay(curDisp + '('); setNewEntry(false); break;
      case 'rparen': pushUndo(curDisp); setDisplay(curDisp + ')'); setNewEntry(false); break;

      case 'sign':
        pushUndo(curDisp);
        if (curDisp.startsWith('−')) setDisplay(curDisp.slice(1));
        else if (curDisp.startsWith('-')) setDisplay(curDisp.slice(1));
        else setDisplay('−' + curDisp);
        break;

      case 'sin': case 'cos': case 'tan':
        pushUndo(curDisp);
        const fnName2 = action;
        setDisplay(curDisp + (curDisp === '0' || newEntry ? '' : '') + fnName2 + '(');
        setNewEntry(false);
        break;

      case 'sinh': setDisplay(curDisp + 'sinh('); setNewEntry(false); break;
      case 'cosh': setDisplay(curDisp + 'cosh('); setNewEntry(false); break;
      case 'tanh': setDisplay(curDisp + 'tanh('); setNewEntry(false); break;
      case 'asin': setDisplay(curDisp + 'asin('); setNewEntry(false); break;
      case 'acos': setDisplay(curDisp + 'acos('); setNewEntry(false); break;
      case 'atan': setDisplay(curDisp + 'atan('); setNewEntry(false); break;
      case 'log': setDisplay(curDisp + 'log('); setNewEntry(false); break;
      case 'ln': setDisplay(curDisp + 'ln('); setNewEntry(false); break;
      case 'sqrt': setDisplay(curDisp + 'sqrt('); setNewEntry(false); break;
      case 'cbrt': setDisplay(curDisp + 'cbrt('); setNewEntry(false); break;
      case 'abs': setDisplay(curDisp + 'abs('); setNewEntry(false); break;

      case 'sqr':
        pushUndo(curDisp);
        try {
          const v = evaluate(curDisp, angleMode);
          if (!v.error) setDisplay(formatNumber(v.value * v.value));
        } catch { setDisplay(curDisp + '²'); }
        break;

      case 'cube':
        try {
          const v = evaluate(curDisp, angleMode);
          if (!v.error) setDisplay(formatNumber(v.value * v.value * v.value));
        } catch { setDisplay(curDisp + '³'); }
        break;

      case 'pow':
        pushUndo(curDisp);
        setDisplay(curDisp + ' ^ ');
        setNewEntry(true);
        break;

      case 'inv':
        pushUndo(curDisp);
        if (curDisp !== '0') setDisplay('1/(' + curDisp + ')');
        break;

      case 'fact':
        try {
          const v = evaluate(curDisp, angleMode);
          if (!v.error && Number.isInteger(v.value) && v.value >= 0) {
            const fact = (n: number): number => n <= 1 ? 1 : n * fact(n - 1);
            setDisplay(formatNumber(fact(v.value)));
          } else setDisplay(curDisp + '!');
        } catch { setDisplay(curDisp + '!'); }
        break;

      case 'percent':
        try {
          const v = evaluate(curDisp, angleMode);
          if (!v.error) setDisplay(formatNumber(v.value / 100));
        } catch { setDisplay(curDisp + '%'); }
        break;

      case 'pi': pushUndo(curDisp); setDisplay(curDisp + 'π'); setNewEntry(false); break;
      case 'euler': pushUndo(curDisp); setDisplay(curDisp + 'e'); setNewEntry(false); break;
      case 'rand': pushUndo(curDisp); setDisplay(formatNumber(Math.random())); setNewEntry(true); break;
      case 'expEE': pushUndo(curDisp); setDisplay(curDisp + 'E'); break;
      case 'ans': pushUndo(curDisp); setDisplay(curDisp + (lastAnswer !== null ? formatNumber(lastAnswer) : '0')); setNewEntry(false); break;
      case 'square': inputDigit('²'); break;
      case 'exp10': setDisplay(curDisp + '10^'); setNewEntry(false); break;
      case 'exp': setDisplay(curDisp + 'e^'); setNewEntry(false); break;
      case 'ysqrt': setDisplay(curDisp + '^(1/'); setNewEntry(false); break;

      // Memory
      case 'mc': setMemory(0); setHasMemory(false); break;
      case 'mr':
        if (hasMemory) {
          pushUndo(curDisp);
          if (newEntry) { setDisplay(formatNumber(memory)); setNewEntry(false); }
          else setDisplay(curDisp + formatNumber(memory));
        }
        break;
      case 'mplus':
        try { const v = evaluate(curDisp, angleMode); if (!v.error) { setMemory(prev => prev + v.value); setHasMemory(true); } } catch {}
        break;
      case 'mminus':
        try { const v = evaluate(curDisp, angleMode); if (!v.error) { setMemory(prev => prev - v.value); setHasMemory(true); } } catch {}
        break;
      case 'ms':
        try { const v = evaluate(curDisp, angleMode); if (!v.error) { setMemory(v.value); setHasMemory(true); } } catch {}
        break;

      // Mode
      case 'deg': setAngleMode('deg'); break;
      case 'rad': setAngleMode('rad'); break;
      case 'drg': setAngleMode(prev => prev === 'deg' ? 'rad' : 'deg'); break;
      case '2nd': setIs2nd(prev => !prev); break;
    }
  }, [display, newEntry, pendingOp, angleMode, lastAnswer, hasMemory, memory, addToHistory, evaluateDisplay, pushUndo]);

  // Live preview
  const previewResult = (() => {
    if (error || !display || display === '0') return '';
    try {
      const res = evaluate(display, angleMode);
      if (!res.error && isFinite(res.value)) return '= ' + formatNumber(res.value);
    } catch {}
    return '';
  })();

  return {
    display, result, previewResult, error, memory, hasMemory, angleMode, is2nd, lastAnswer,
    history, settings, undoStack, redoStack,
    handleAction, clearHistory, undo, redo,
    setAngleMode, setIs2nd, setSettings: setSettingsState,
  };
}
