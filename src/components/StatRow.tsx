import React from 'react';
import { StyleSheet, View } from 'react-native';
import StatCard from './StatCard';
import type { StatEntry } from './StatCard';

type Props = {
  items: StatEntry[];
  /** 2 for the 2x2 lifetime grid on Progress, 3 for the Result row */
  columns?: number;
};

export function visibleStats(items: StatEntry[]): StatEntry[] {
  return items.filter(i => !i.empty && i.value !== '' && i.value !== '0');
}

/**
 * Renders the row only when at least two pills carry a value. One lonely pill
 * (or none) reads as a broken skeleton loader, so it is dropped entirely.
 */
export function StatRow({ items, columns = 3 }: Props) {
  const visible = visibleStats(items);
  if (visible.length < 2) {
    return null;
  }
  const rows: StatEntry[][] = [];
  for (let i = 0; i < visible.length; i += columns) {
    rows.push(visible.slice(i, i + columns));
  }
  return (
    <View style={styles.wrap}>
      {rows.map((row, idx) => (
        <View key={'row' + idx} style={styles.row}>
          {row.map(item => (
            <View key={item.key} style={styles.slot}>
              <StatCard
                value={item.value}
                label={item.label}
                accent={item.accent}
              />
            </View>
          ))}
          {row.length < columns
            ? Array.from({ length: columns - row.length }, (_, k) => (
                <View key={'pad' + k} style={styles.slot} />
              ))
            : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  slot: { flex: 1 },
});

export default StatRow;
