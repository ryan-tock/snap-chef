// themedText.tsx
import React from 'react';
import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import { useThemeToggle } from '@/components/ThemeToggleContext';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  // ✅ Call the hook inside the component
  const { isDark } = useThemeToggle();
  const currentColorScheme: 'light' | 'dark' = isDark ? 'dark' : 'light';

  // Use the existing logic for picking text color
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Optionally, if you want the title style to use your theme’s text color:
  const dynamicTitleStyle = {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40, // numeric lineHeight
    color: Colors[currentColorScheme].text,
  };

  return (
    <Text
      style={[
        { color }, 
        type === 'default' && styles.default,
        type === 'title' && dynamicTitleStyle,
        type === 'defaultSemiBold' && styles.defaultSemiBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
