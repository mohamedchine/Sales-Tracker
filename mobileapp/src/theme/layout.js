/** Page content inset — matches web `.container` / `.admin-main` on mobile */
export const contentInset = {
  paddingTop: 20,
  paddingLeft: 16,
  paddingRight: 16,
};

export function tabScrollContent(insets) {
  return {
    ...contentInset,
    paddingBottom: 80 + insets.bottom,
  };
}
