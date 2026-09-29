import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';
import { COLORS } from '../../config/constants';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  disabled = false,
  multiline = false,
}: InputProps) {
  // en campos de contraseña, el ojito alterna entre ocultar y mostrar el texto.
  const [hidden, setHidden] = useState(true);

  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry && hidden}
      right={
        secureTextEntry ? (
          <TextInput.Icon
            icon={hidden ? 'eye' : 'eye-off'}
            color={COLORS.textSecondary}
            onPress={() => setHidden((h) => !h)}
            forceTextInputFocus={false}
          />
        ) : undefined
      }
      keyboardType={keyboardType}
      disabled={disabled}
      multiline={multiline}
      error={!!error}
      mode="outlined"
      outlineColor={COLORS.border}
      activeOutlineColor={COLORS.primary}
      textColor={COLORS.textPrimary}
      style={styles.input}
      contentStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.surface,
    fontSize: 15,
  },
  content: {
    minHeight: 20,
  },
});
