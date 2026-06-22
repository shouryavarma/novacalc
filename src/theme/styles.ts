import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors } from './colors';

const { width, height } = Dimensions.get('window');
const isLandscape = width > height;

export const btnSize = isLandscape
  ? { minWidth: Math.min((width - 100) / 7, 80), minHeight: Math.min((height - 180) / 6, 44) }
  : { minWidth: (width - 40) / 5, minHeight: 48 };

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, height: 40,
    backgroundColor: colors.glass, borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
  },
  topbarTitle: { fontSize: 14, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
  topbarAccent: { color: colors.accent2 },
  topbarBadge: {
    fontSize: 9, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)',
    color: colors.textTer, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    marginLeft: 8, overflow: 'hidden',
  },
  topbarActions: { flexDirection: 'row', gap: 2 },
  topbarBtn: {
    width: 32, height: 32, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },

  // Layout
  calcWrap: {
    flex: 1, flexDirection: isLandscape ? 'row' : 'column',
  },

  // Display
  displayArea: {
    flex: isLandscape ? 0 : undefined,
    width: isLandscape ? Math.min(width * 0.3, 320) : undefined,
    padding: 16, justifyContent: 'flex-end',
    backgroundColor: colors.surface,
    borderRightWidth: isLandscape ? 1 : 0,
    borderBottomWidth: isLandscape ? 0 : 1,
    borderColor: colors.glassBorder,
    minHeight: isLandscape ? undefined : 140,
  },
  modeStrip: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  modeChip: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  modeChipActive: { backgroundColor: 'rgba(108,92,231,0.12)', borderColor: colors.accent1 },
  modeChipText: { fontSize: 10, color: colors.textTer },
  modeChipTextActive: { color: colors.accent2 },
  modeDot: { width: 5, height: 5, borderRadius: 3 },
  modeDotDeg: { backgroundColor: colors.cyan },
  modeDotRad: { backgroundColor: colors.orange },
  exprSub: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12, color: colors.textTer, textAlign: 'right', minHeight: 18,
  },
  exprInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 22, color: colors.text, textAlign: 'right',
    lineHeight: 30,
  },
  exprResult: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 38, fontWeight: '700', color: colors.accent2, textAlign: 'right',
    lineHeight: 46,
  },
  exprResultError: { color: colors.red },
  memBadge: {
    position: 'absolute', top: 12, right: 12,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, backgroundColor: 'rgba(116,185,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(116,185,255,0.12)',
  },
  memBadgeText: { fontSize: 9, color: colors.fnMem, fontWeight: '600' },

  // Buttons
  btnArea: {
    flex: 1, padding: 8, gap: 4, justifyContent: 'center',
  },
  btnRow: { flexDirection: 'row', gap: 4 },
  btn: {
    flex: 1, minHeight: 42, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1, borderColor: colors.glassBorder,
    paddingHorizontal: 6,
  },
  btnText: { fontSize: 12, fontWeight: '600', color: colors.text },
  btnNum: { backgroundColor: colors.card },
  btnNumText: { fontSize: 16, fontWeight: '700' },
  btnOp: { backgroundColor: 'rgba(0,206,201,0.05)', borderColor: 'rgba(0,206,201,0.08)' },
  btnOpText: { color: colors.cyan },
  btnEq: { backgroundColor: colors.accent1, borderColor: 'transparent' },
  btnEqText: { color: colors.bg, fontSize: 18, fontWeight: '800' },
  btnClr: { backgroundColor: 'rgba(255,107,107,0.05)', borderColor: 'rgba(255,107,107,0.08)' },
  btnClrText: { color: colors.red },
  btnFn: { backgroundColor: 'rgba(162,155,254,0.04)', borderColor: 'rgba(162,155,254,0.06)' },
  btnFnText: { color: colors.fnTrig, fontSize: 11 },
  btnLog: { backgroundColor: 'rgba(0,206,201,0.04)', borderColor: 'rgba(0,206,201,0.06)' },
  btnLogText: { color: colors.fnLog, fontSize: 11 },
  btnPw: { backgroundColor: 'rgba(253,203,110,0.04)', borderColor: 'rgba(253,203,110,0.06)' },
  btnPwText: { color: colors.fnPwr },
  btnMem: { backgroundColor: 'rgba(116,185,255,0.04)', borderColor: 'rgba(116,185,255,0.06)' },
  btnMemText: { color: colors.fnMem, fontSize: 10 },
  btnCn: { backgroundColor: 'rgba(253,121,168,0.04)', borderColor: 'rgba(253,121,168,0.06)' },
  btnCnText: { color: colors.fnConst },
  btnBs: { backgroundColor: 'rgba(253,203,110,0.05)', borderColor: 'rgba(253,203,110,0.08)' },
  btnBsText: { color: colors.orange },

  // Info bar
  infoBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, height: 24,
    backgroundColor: 'rgba(0,0,0,0.15)', borderTopWidth: 1, borderTopColor: colors.glassBorder,
  },
  infoBarText: { fontSize: 9, color: colors.textTer },
  infoBarLeft: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  infoBarRight: { flexDirection: 'row', gap: 12, alignItems: 'center' },

  // Drawer
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10,
  },
  drawer: {
    position: 'absolute', top: 0, right: 0, bottom: 0,
    width: Math.min(380, width * 0.85),
    backgroundColor: colors.surface, borderLeftWidth: 1, borderLeftColor: colors.glassBorder,
    zIndex: 11,
  },
  drawerHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
  },
  drawerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  drawerBody: { flex: 1, padding: 14 },

  // History
  histItem: {
    padding: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)',
    borderRadius: 7,
  },
  histExpr: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, color: colors.textSec },
  histResult: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 18, fontWeight: '700', color: colors.accent2, marginTop: 4,
  },
  histTime: { fontSize: 10, color: colors.textTer, marginTop: 4 },
  histEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  histEmptyText: { color: colors.textTer, fontSize: 14, marginTop: 12 },

  // Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 20,
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  modal: {
    width: '100%', maxWidth: 480, maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: 16, borderWidth: 1, borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  modalHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  modalBody: { padding: 16 },
  modalClose: { width: 30, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },

  // Toast
  toastContainer: {
    position: 'absolute', bottom: 40, left: 0, right: 0,
    alignItems: 'center', zIndex: 30, pointerEvents: 'box-none',
  },
  toast: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.glassBorder,
  },
  toastText: { fontSize: 13, color: colors.text },

  // Toggle
  toggle: {
    width: 40, height: 22, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)', padding: 2,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: colors.accent1 },
  toggleKnob: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: colors.text,
  },
  toggleKnobOn: { alignSelf: 'flex-end' },

  // Settings
  settingGroup: { marginBottom: 20 },
  settingGroupTitle: {
    fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8,
    color: colors.textSec, marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  settingLabel: { fontSize: 14, color: colors.text },
  settingDesc: { fontSize: 11, color: colors.textTer, marginTop: 2 },
});
