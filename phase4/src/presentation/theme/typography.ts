// ABOUTME: Typography constants for Commit Mono brutalist theme
// ABOUTME: Single monospaced typeface at defined size/weight scales

export const fonts = {
  regular: 'CommitMono-Regular',
  bold: 'CommitMono-Bold',
} as const;

export const typography = {
  title: { fontFamily: fonts.bold, fontSize: 24 },
  sectionHeader: { fontFamily: fonts.bold, fontSize: 16, textTransform: 'uppercase' as const },
  body: { fontFamily: fonts.regular, fontSize: 14 },
  label: { fontFamily: fonts.regular, fontSize: 12, textTransform: 'uppercase' as const },
  button: { fontFamily: fonts.bold, fontSize: 14, textTransform: 'uppercase' as const },
} as const;
