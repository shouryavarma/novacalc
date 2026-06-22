import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, Dimensions, BackHandler, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { CalcButton } from '../components/CalcButton';
import { Display } from '../components/Display';
import { Toast } from '../components/Toast';
import { evaluate, formatNumber, preview as calcPreview, AngleMode } from '../engine/calcEngine';
import { HistoryScreen } from './HistoryScreen';
import { HelpScreen } from './HelpScreen';
import { SettingsScreen } from './SettingsScreen';
import { AboutScreen } from './AboutScreen';

const { width: SCREEN_W } = Dimensions.get('window');

interface HistoryEntry {
  expr: string; result: string; time: string; id: number;
}

interface Settings {
  largeDisplay: boolean; sound: boolean; autoSave: boolean; idleTimeout: number;
}

type Screen = 'calc' | 'history' | 'help' | 'settings' | 'about';

export const CalculatorScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  // State
  const [display, setDisplay] = useState('0');
  const [result, setResult] = useState('');
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');
  const [is2nd, setIs2nd] = useState(false);
  const [memory, setMemory] = useState(0);
  const [hasMemory, setHasMemory] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [newEntry, setNewEntry] = useState(true);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<Settings>({
    largeDisplay: false, sound: false, autoSave: true, idleTimeout: 600,
  });
  const [activeScreen, setActiveScreen] = useState<Screen>('calc');
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'success' | 'error' } | null>(null);

  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Load saved data
  useEffect(() => {
    try {
      const h = localStorage.getItem('nc_hist');
      if (h) setHistory(JSON.parse(h));
      const s = localStorage.getItem('nc_set');
      if (s) setSettings(prev => ({ ...prev, ...JSON.parse(s) }));
    } catch {}
  }, []);

  const saveHist = useCallback((h: HistoryEntry[]) => {
    try { localStorage.setItem('nc_hist', JSON.stringify(h.slice(0, 100))); } catch {}
  }, []);
  const saveSet = useCallback((s: Settings) => {
    try { localStorage.setItem('nc_set', JSON.stringify(s)); } catch {}
  }, []);

  const pushUndo = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-50), display]);
    setRedoStack([]);
  }, [display]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, display]);
    setDisplay(last);
    setUndoStack(prev => prev.slice(0, -1));
  }, [undoStack, display]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, display]);
    setDisplay(last);
    setRedoStack(prev => prev.slice(0, -1));
  }, [redoStack, display]);

  const evalExpr = useCallback((expr: string) => {
    const res = evaluate(expr, angleMode);
    if (res.error || isNaN(res.value)) {
      setResult('Error');
      setError(true);
      return null;
    }
    if (!isFinite(res.value)) {
      setResult(res.value > 0 ? 'Infinity' : '-Infinity');
      setError(true);
      return null;
    }
    const fmt = formatNumber(res.value);
    setResult(fmt);
    setError(false);
    setLastAnswer(res.value);
    setNewEntry(true);
    // Add to history with the display expression
    const entry: HistoryEntry = {
      expr, result: fmt, time: new Date().toLocaleString(), id: Date.now(),
    };
    setHistory(prev => {
      const upd = [entry, ...prev].slice(0, 100);
      if (settings.autoSave) saveHist(upd);
      return upd;
    });
    return res.value;
  }, [angleMode, settings.autoSave, saveHist]);

  const handleAction = useCallback((action: string) => {
    setError(false);

    const evalAndSet = (d: string) => {
      const res = evaluate(d, angleMode);
      if (!res.error && isFinite(res.value)) {
        setResult(formatNumber(res.value));
        setError(false);
      } else { setResult(''); }
    };

    switch (action) {
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9': {
        pushUndo();
        const next = newEntry ? action : display + action;
        setDisplay(next);
        setNewEntry(false);
        evalAndSet(next);
        break;
      }
      case 'decimal': {
        if (newEntry) { pushUndo(); setDisplay('0.'); setNewEntry(false); break; }
        if (!display.includes('.')) { pushUndo(); const next = display + '.'; setDisplay(next); evalAndSet(next); }
        break;
      }
      case 'add': case 'subtract': case 'multiply': case 'divide': case 'mod': {
        const syms: Record<string, string> = { add: '+', subtract: '−', multiply: '×', divide: '÷', mod: ' Mod ' };
        const sym = syms[action];
        if (!newEntry && pendingOp) { evalExpr(display); }
        pushUndo();
        const next = display + ' ' + sym + ' ';
        setDisplay(next);
        setPendingOp(sym);
        setNewEntry(true);
        break;
      }
      case 'equals': {
        if (newEntry && lastAnswer !== null && pendingOp) {
          const next = formatNumber(lastAnswer) + ' ' + pendingOp + ' ';
          setDisplay(next);
          evalExpr(next.slice(0, -3));
          setPendingOp(null);
        } else {
          evalExpr(display.replace(/ × /g, ' * ').replace(/ ÷ /g, ' / ').replace(/ − /g, ' - ').replace(/ Mod /g, ' % ').replace(/ \^ /g, ' ^ '));
          setPendingOp(null);
        }
        break;
      }
      case 'clear': setDisplay('0'); setResult(''); setError(false); setPendingOp(null); setNewEntry(true); setUndoStack([]); setRedoStack([]); break;
      case 'ce': pushUndo(); setDisplay('0'); setNewEntry(true); break;
      case 'bksp': {
        if (display.length > 1) { pushUndo(); const next = display.slice(0, -1); setDisplay(next); evalAndSet(next); }
        else { pushUndo(); setDisplay('0'); }
        break;
      }
      case 'lparen': pushUndo(); const lp = display + '('; setDisplay(lp); setNewEntry(false); evalAndSet(lp); break;
      case 'rparen': pushUndo(); const rp = display + ')'; setDisplay(rp); setNewEntry(false); evalAndSet(rp); break;
      case 'sign': {
        pushUndo();
        if (display.startsWith('−')) setDisplay(display.slice(1));
        else if (display.startsWith('-')) setDisplay(display.slice(1));
        else setDisplay('−' + display);
        break;
      }
      case 'sin': pushUndo(); const sin = display + 'sin('; setDisplay(sin); setNewEntry(false); break;
      case 'cos': pushUndo(); const cos = display + 'cos('; setDisplay(cos); setNewEntry(false); break;
      case 'tan': pushUndo(); const tan = display + 'tan('; setDisplay(tan); setNewEntry(false); break;
      case 'sinh': pushUndo(); display + 'sinh('; setDisplay(d => d + 'sinh('); setNewEntry(false); break;
      case 'cosh': setDisplay(d => d + 'cosh('); setNewEntry(false); break;
      case 'tanh': setDisplay(d => d + 'tanh('); setNewEntry(false); break;
      case 'asin': pushUndo(); setDisplay(d => d + 'asin('); setNewEntry(false); break;
      case 'acos': setDisplay(d => d + 'acos('); setNewEntry(false); break;
      case 'atan': setDisplay(d => d + 'atan('); setNewEntry(false); break;
      case 'log': pushUndo(); setDisplay(d => d + 'log('); setNewEntry(false); break;
      case 'ln': pushUndo(); setDisplay(d => d + 'ln('); setNewEntry(false); break;
      case 'sqrt': pushUndo(); setDisplay(d => d + 'sqrt('); setNewEntry(false); break;
      case 'cbrt': pushUndo(); setDisplay(d => d + 'cbrt('); setNewEntry(false); break;
      case 'abs': pushUndo(); setDisplay(d => d + 'abs('); setNewEntry(false); break;
      case 'sqr': {
        pushUndo();
        try { const r = evaluate(display, angleMode); if (!r.error) { const sq = formatNumber(r.value * r.value); setDisplay(sq); setResult(''); } }
        catch { setDisplay(d => d + '²'); }
        break;
      }
      case 'cube': {
        pushUndo();
        try { const r = evaluate(display, angleMode); if (!r.error) { const cu = formatNumber(r.value * r.value * r.value); setDisplay(cu); setResult(''); } }
        catch { setDisplay(d => d + '³'); }
        break;
      }
      case 'pow': pushUndo(); setDisplay(d => d + ' ^ '); setNewEntry(true); break;
      case 'inv': pushUndo(); if (display !== '0') setDisplay(d => '1/(' + d + ')'); break;
      case 'fact': {
        try { const r = evaluate(display, angleMode); if (!r.error && Number.isInteger(r.value) && r.value >= 0) {
          const f = (n: number): number => n <= 1 ? 1 : n * f(n - 1);
          pushUndo(); setDisplay(formatNumber(f(r.value))); setResult('');
        }} catch { setDisplay(d => d + '!'); }
        break;
      }
      case 'percent': {
        try { const r = evaluate(display, angleMode); if (!r.error) { pushUndo(); setDisplay(formatNumber(r.value / 100)); } }
        catch { setDisplay(d => d + '%'); }
        break;
      }
      case 'pi': pushUndo(); setDisplay(d => d + 'π'); setNewEntry(false); break;
      case 'euler': pushUndo(); setDisplay(d => d + 'e'); setNewEntry(false); break;
      case 'rand': pushUndo(); setDisplay(formatNumber(Math.random())); setNewEntry(true); break;
      case 'expEE': pushUndo(); setDisplay(d => d + 'E'); break;
      case 'ans': pushUndo(); setDisplay(d => d + (lastAnswer !== null ? formatNumber(lastAnswer) : '0')); break;
      case 'mc': setMemory(0); setHasMemory(false); setToast({ msg: 'Memory cleared', type: 'info' }); break;
      case 'mr': if (hasMemory) { pushUndo(); setDisplay(d => newEntry ? formatNumber(memory) : d + formatNumber(memory)); setNewEntry(false); } break;
      case 'mplus': try { const r = evaluate(display, angleMode); if (!r.error) { setMemory(prev => prev + r.value); setHasMemory(true); setToast({ msg: 'Added to memory', type: 'info' }); } } catch {} break;
      case 'mminus': try { const r = evaluate(display, angleMode); if (!r.error) { setMemory(prev => prev - r.value); setHasMemory(true); setToast({ msg: 'Subtracted from memory', type: 'info' }); } } catch {} break;
      case 'ms': try { const r = evaluate(display, angleMode); if (!r.error) { setMemory(r.value); setHasMemory(true); setToast({ msg: 'Stored to memory', type: 'info' }); } } catch {} break;
      case 'deg': setAngleMode('deg'); break;
      case 'rad': setAngleMode('rad'); break;
      case 'drg': setAngleMode(prev => prev === 'deg' ? 'rad' : 'deg'); break;
      case '2nd': setIs2nd(prev => !prev); break;
    }
  }, [display, newEntry, pendingOp, angleMode, lastAnswer, memory, hasMemory, evalExpr, pushUndo]);

  // Keyboard shortcut effect (web)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, string> = {
        '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
        '.':'decimal','Enter':'equals','=':'equals','Escape':'clear','Delete':'ce',
        'Backspace':'bksp','(':'lparen',')':'rparen',
        '+':'add','-':'subtract','*':'multiply','/':'divide',
        's':'sin','c':'cos','t':'tan','l':'log','n':'ln',
        'p':'pi','e':'euler','r':'rand','!':'fact','%':'percent',
        '^':'pow','q':'sqr','w':'sqrt',
      };
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); return; }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const action = keyMap[e.key];
      if (action) { e.preventDefault(); handleAction(action); }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }
  }, [handleAction, undo, redo]);

  // Hardware back button (Android)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeScreen !== 'calc') { setActiveScreen('calc'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [activeScreen]);

  // Preview
  const preview = (() => {
    if (error || !display || display === '0') return '';
    try {
      const res = evaluate(display, angleMode);
      if (!res.error && isFinite(res.value)) return '= ' + formatNumber(res.value);
    } catch {}
    return '';
  })();

  const icon = (name: any) => <Ionicons name={name} size={16} color={colors.textSec} />;

  const btnProps = (action: string, variant: any = 'fn') => ({
    onPress: () => handleAction(action),
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      {/* Top Bar */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 14, height: 40,
        backgroundColor: 'rgba(12,17,32,0.75)', borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
            <Text style={{ color: colors.accent2 }}>Nova</Text>Calc
          </Text>
          <Text style={{
            fontSize: 8, paddingHorizontal: 5, paddingVertical: 2,
            borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', color: colors.textTer,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', overflow: 'hidden',
          }}>v1.0</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 2 }}>
          <TouchableOpacityBtn onPress={undo} icon="arrow-undo" disabled={undoStack.length === 0} />
          <TouchableOpacityBtn onPress={redo} icon="arrow-redo" disabled={redoStack.length === 0} />
          <TouchableOpacityBtn onPress={() => setActiveScreen('history')} icon="time-outline" />
          <TouchableOpacityBtn onPress={() => setActiveScreen('help')} icon="help-circle-outline" />
          <TouchableOpacityBtn onPress={() => setActiveScreen('settings')} icon="settings-outline" />
          <TouchableOpacityBtn onPress={() => setActiveScreen('about')} icon="information-circle-outline" />
        </View>
      </View>

      {activeScreen === 'calc' ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Display Panel */}
          <View style={{
            width: Math.min(SCREEN_W * 0.28, 280),
            padding: 14, justifyContent: 'flex-end',
            backgroundColor: colors.surface,
            borderRightWidth: 1, borderRightColor: colors.glassBorder,
          }}>
            <Display
              expression={display}
              result={result}
              preview={preview}
              angleMode={angleMode}
              is2nd={is2nd}
              hasMemory={hasMemory}
              error={error}
            />
          </View>

          {/* Button Grid */}
          <ScrollView style={{ flex: 1, padding: 6 }} contentContainerStyle={{ gap: 4 }}>
            {/* Row 1: Memory */}
            <Row>
              <CalcButton label="MC" variant="mem" onPress={() => handleAction('mc')} />
              <CalcButton label="MR" variant="mem" onPress={() => handleAction('mr')} />
              <CalcButton label="M+" variant="mem" onPress={() => handleAction('mplus')} />
              <CalcButton label="M−" variant="mem" onPress={() => handleAction('mminus')} />
              <CalcButton label="MS" variant="mem" onPress={() => handleAction('ms')} />
            </Row>
            {/* Row 2: Trig */}
            <Row>
              <CalcButton label="sin" variant="fn" onPress={() => handleAction('sin')} />
              <CalcButton label="cos" variant="fn" onPress={() => handleAction('cos')} />
              <CalcButton label="tan" variant="fn" onPress={() => handleAction('tan')} />
              <CalcButton label="sinh" variant="fn" onPress={() => handleAction('sinh')} />
              <CalcButton label="cosh" variant="fn" onPress={() => handleAction('cosh')} />
              <CalcButton label="tanh" variant="fn" onPress={() => handleAction('tanh')} />
            </Row>
            {/* Row 3: Inverse Trig */}
            <Row>
              <CalcButton label="sin⁻¹" variant="fn" onPress={() => handleAction('asin')} />
              <CalcButton label="cos⁻¹" variant="fn" onPress={() => handleAction('acos')} />
              <CalcButton label="tan⁻¹" variant="fn" onPress={() => handleAction('atan')} />
              <CalcButton label="x!" variant="fn" onPress={() => handleAction('fact')} />
              <CalcButton label="%" variant="fn" onPress={() => handleAction('percent')} />
              <CalcButton label="1/x" variant="fn" onPress={() => handleAction('inv')} />
            </Row>
            {/* Row 4: Log/Exp */}
            <Row>
              <CalcButton label="log" variant="log" onPress={() => handleAction('log')} />
              <CalcButton label="ln" variant="log" onPress={() => handleAction('ln')} />
              <CalcButton label="10ˣ" variant="log" onPress={() => handleAction('exp10')} />
              <CalcButton label="eˣ" variant="log" onPress={() => handleAction('exp')} />
              <CalcButton label="e" variant="cn" onPress={() => handleAction('euler')} />
              <CalcButton label="π" variant="cn" onPress={() => handleAction('pi')} />
            </Row>
            {/* Row 5: Power/Root */}
            <Row>
              <CalcButton label="x²" variant="pw" onPress={() => handleAction('sqr')} />
              <CalcButton label="x³" variant="pw" onPress={() => handleAction('cube')} />
              <CalcButton label="xʸ" variant="pw" onPress={() => handleAction('pow')} />
              <CalcButton label="√" variant="pw" onPress={() => handleAction('sqrt')} />
              <CalcButton label="∛" variant="pw" onPress={() => handleAction('cbrt')} />
              <CalcButton label="ʸ√x" variant="pw" onPress={() => handleAction('ysqrt')} />
            </Row>
            {/* Row 6: Parens/Misc */}
            <Row>
              <CalcButton label="(" variant="op" onPress={() => handleAction('lparen')} />
              <CalcButton label=")" variant="op" onPress={() => handleAction('rparen')} />
              <CalcButton label="|x|" variant="op" onPress={() => handleAction('abs')} />
              <CalcButton label="Mod" variant="op" onPress={() => handleAction('mod')} />
              <CalcButton label="Rand" variant="op" onPress={() => handleAction('rand')} />
              <CalcButton label="±" variant="op" onPress={() => handleAction('sign')} />
            </Row>
            {/* Row 7: 7 8 9 / BS */}
            <Row>
              <CalcButton label="Exp" variant="log" onPress={() => handleAction('expEE')} />
              <CalcButton label="Ans" variant="cn" onPress={() => handleAction('ans')} />
              <CalcButton label="7" variant="num" onPress={() => handleAction('7')} />
              <CalcButton label="8" variant="num" onPress={() => handleAction('8')} />
              <CalcButton label="9" variant="num" onPress={() => handleAction('9')} />
              <CalcButton label="÷" variant="op" onPress={() => handleAction('divide')} />
              <CalcButton label="⌫" variant="bs" onPress={() => handleAction('bksp')} />
            </Row>
            {/* Row 8: 4 5 6 × CE */}
            <Row>
              <CalcButton label="x²" variant="pw" onPress={() => handleAction('sqr')} />
              <CalcButton label="√" variant="pw" onPress={() => handleAction('sqrt')} />
              <CalcButton label="4" variant="num" onPress={() => handleAction('4')} />
              <CalcButton label="5" variant="num" onPress={() => handleAction('5')} />
              <CalcButton label="6" variant="num" onPress={() => handleAction('6')} />
              <CalcButton label="×" variant="op" onPress={() => handleAction('multiply')} />
              <CalcButton label="CE" variant="clr" onPress={() => handleAction('ce')} />
            </Row>
            {/* Row 9: 1 2 3 − C */}
            <Row>
              <CalcButton label="DRG▾" variant="mem" onPress={() => handleAction('drg')} />
              <CalcButton label="Hyp" variant="cn" onPress={() => handleAction('sinh')} />
              <CalcButton label="1" variant="num" onPress={() => handleAction('1')} />
              <CalcButton label="2" variant="num" onPress={() => handleAction('2')} />
              <CalcButton label="3" variant="num" onPress={() => handleAction('3')} />
              <CalcButton label="−" variant="op" onPress={() => handleAction('subtract')} />
              <CalcButton label="C" variant="clr" onPress={() => handleAction('clear')} />
            </Row>
            {/* Row 10: 0 . + = */}
            <Row>
              <CalcButton label="2nd" variant="fn" onPress={() => handleAction('2nd')} />
              <CalcButton label="π" variant="cn" onPress={() => handleAction('pi')} />
              <CalcButton label="0" variant="num" onPress={() => handleAction('0')} />
              <CalcButton label="." variant="num" onPress={() => handleAction('decimal')} />
              <CalcButton label="+" variant="op" onPress={() => handleAction('add')} />
              <CalcButton label="=" variant="eq" onPress={() => handleAction('equals')} />
              <CalcButton label="MC" variant="mem" onPress={() => handleAction('mc')} />
            </Row>
          </ScrollView>
        </View>
      ) : activeScreen === 'history' ? (
        <HistoryScreen
          history={history}
          onClear={() => { setHistory([]); saveHist([]); }}
          onSelect={(expr) => { setDisplay(expr); setActiveScreen('calc'); }}
          onClose={() => setActiveScreen('calc')}
        />
      ) : activeScreen === 'help' ? (
        <HelpScreen onClose={() => setActiveScreen('calc')} />
      ) : activeScreen === 'settings' ? (
        <SettingsScreen
          settings={settings}
          onUpdate={(s) => { setSettings(s); saveSet(s); }}
          onClose={() => setActiveScreen('calc')}
        />
      ) : (
        <AboutScreen onClose={() => setActiveScreen('calc')} />
      )}

      {/* Bottom Info Bar */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 14, height: 22,
        backgroundColor: 'rgba(0,0,0,0.15)', borderTopWidth: 1, borderTopColor: colors.glassBorder,
      }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Text style={{ fontSize: 9, color: colors.textTer }}>{angleMode.toUpperCase()}</Text>
          {hasMemory && <Text style={{ fontSize: 9, color: colors.fnMem, fontWeight: '600' }}>M</Text>}
          {is2nd && <Text style={{ fontSize: 9, color: colors.accent2, fontWeight: '600' }}>2nd</Text>}
        </View>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Text style={{ fontSize: 9, color: colors.textTer }}>NovaCalc</Text>
          <Text style={{ fontSize: 9, color: colors.textTer }}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>

      {/* Toast */}
      <View style={{
        position: 'absolute', bottom: 40, left: 0, right: 0,
        alignItems: 'center', zIndex: 30, pointerEvents: 'box-none',
      }}>
        <Toast
          message={toast?.msg || ''}
          visible={!!toast}
          type={toast?.type || 'info'}
          onHide={() => setToast(null)}
        />
      </View>
    </View>
  );
};

// Helper components
const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ flexDirection: 'row', gap: 4 }}>{children}</View>
);

const TouchableOpacityBtn: React.FC<{ onPress: () => void; icon: string; disabled?: boolean }> = ({
  onPress, icon, disabled,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={{
      width: 30, height: 30, borderRadius: 7,
      alignItems: 'center', justifyContent: 'center',
      opacity: disabled ? 0.3 : 1,
    }}
  >
    <Ionicons name={icon as any} size={16} color={colors.textSec} />
  </TouchableOpacity>
);

