import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  small?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  icon,
  small = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        small ? styles.smallButton : null,
        disabled || loading ? styles.disabledButton : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size={small ? 'small' : 'small'} />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.buttonText,
              small ? styles.smallButtonText : null,
              textStyle,
            ]}
          >
            {children}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  smallButtonText: {
    fontSize: 14,
  },
});

export default Button;