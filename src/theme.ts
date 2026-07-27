// 全局主题：dark = 暗夜宇宙（默认）；light = 玫瑰奶油界面 + 深色星空剧场。
// 3D 舞台在两种主题下都保持深色（发光/粒子为加色混合，洗白即毁），
// 浅色只改变 header / 右侧面板 / 知识库抽屉等 DOM 界面 —— 通过根节点
// [data-theme='light'] 作用域的 CSS 覆盖 + --ink 变量实现。
export type AppTheme = 'dark' | 'light';

const STORAGE_KEY = 'mc3d-theme';

export function initialTheme(): AppTheme {
  const q = new URLSearchParams(window.location.search).get('theme');
  if (q === 'light' || q === 'dark') return q;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* localStorage 不可用时忽略 */
  }
  return 'dark';
}

export function persistTheme(t: AppTheme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* ignore */
  }
}
