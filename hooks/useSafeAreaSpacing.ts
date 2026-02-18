import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useSafeAreaSpacing() {
  const insets = useSafeAreaInsets();
  const { top, right, bottom, left } = insets;
  return { top, right, bottom, left };
}
