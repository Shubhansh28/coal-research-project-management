import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { COLORS } from '../constants';

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.amber,
    secondary: COLORS.cyan,
    background: COLORS.background,
    surface: COLORS.white,
    error: COLORS.danger
  },
  roundness: 12
};
