export const THEMES = [{ id: 'signalbrief', label: 'Field notes', description: 'Warm paper, forest ink, and evidence in the margins.' }] as const
export type ThemeId = (typeof THEMES)[number]['id']
export function getActiveTheme(): ThemeId { return 'signalbrief' }
export function getTheme(_id: string) { return THEMES[0] }
