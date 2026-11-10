import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Trash2, X } from 'lucide-react-native';
import { colors } from '../constants/theme';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

type Props = {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** the one destructive action in the app asks first */
export function ConfirmPanel({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <View style={styles.scrim}>
      <View style={styles.card}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.body} numberOfLines={3}>
          {body}
        </Text>
        <View style={styles.actions}>
          <PrimaryButton
            label={confirmLabel}
            Icon={Trash2}
            height={56}
            fontSize={16}
            onPress={onConfirm}
          />
          <SecondaryButton label="CANCEL" Icon={X} onPress={onCancel} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(10,10,15,0.86)',
  },
  card: {
    width: '100%',
    gap: 10,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actions: { gap: 10, marginTop: 6 },
});

export default ConfirmPanel;
