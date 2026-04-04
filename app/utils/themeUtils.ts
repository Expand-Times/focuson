
export const getFilteredThemeColors = (theme: any): Record<string, string> => {
  const rawThemeColors = {
    modalBg: theme?.modalbg?.backgroundColor,
    textColor: theme?.open?.color,
    subtitleColor: theme?.select?.color,
    buttonBg: theme?.numberbg?.backgroundColor,
    buttonTextColor: theme?.number?.color,
    quitButtonBg: theme?.quitbg?.backgroundColor,
    quitButtonTextColor: theme?.quit?.color,
    dividerColor: theme?.bordert?.borderColor,
    toggleColor: theme?.toggle?.color,
    toggleIconColor: theme?.togglei?.color,
    whenTextColor: theme?.when?.color,
    remindTextColor: theme?.remind?.color,
  };

  const themeColors: Record<string, string> = {};
  Object.entries(rawThemeColors).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      themeColors[key] = String(value);
    }
  });

  return themeColors;
};

export default function themeUtilsRoute() { return null; }
