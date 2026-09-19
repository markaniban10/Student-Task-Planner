// components/SubjectFilterBar.js
//
// A horizontally-scrolling row of "chips" (buttons) — one per subject, plus
// an "All" chip. Tapping a chip tells the parent (HomeScreen) which subject
// to filter by. This component holds NO state of its own about which chip
// is selected — that's intentionally kept in HomeScreen and passed down as
// the `selected` prop, so HomeScreen can use it to filter the task list.
// (This is the same "lift state up" idea used for TaskContext, just at a
// smaller, local scale between one parent and one child.)

import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SubjectFilterBar({ subjects, selected, onSelect }) {
  // We always show "All" first, then every unique subject found in the data.
  const chips = ['All', ...subjects];

  // Same pattern as TaskCard.js: pull the active palette and build the
  // StyleSheet from it.
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    // `wrapper` is the fix for the "chips taking up too much space" bug:
    // a horizontal ScrollView with no explicit height can stretch to fill
    // whatever vertical space its parent flex column has left over, which
    // is exactly what was happening — the chips grew into tall rectangles
    // instead of staying as small pills. Giving the wrapper a fixed height
    // caps the whole bar, no matter what's above or below it on screen.
    <View style={styles.wrapper}>
      <ScrollView
        horizontal // scroll sideways instead of the default vertical
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}
      >
        {chips.map((subject) => {
          const isActive = subject === selected;
          return (
            <TouchableOpacity
              key={subject}
              onPress={() => onSelect(subject)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, isActive && styles.chipTextActive]}
                numberOfLines={1}
              >
                {subject}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    wrapper: {
      height: 44, // fixed height for the ENTIRE filter bar — this is the key fix
    },
    scroll: {
      flexGrow: 0, // tells the ScrollView "don't expand to fill extra space"
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center', // vertically centers each chip inside the 44px bar
      paddingHorizontal: 16,
    },
    chip: {
      height: 32, // fixed, compact chip height — was unbounded before
      justifyContent: 'center', // centers the label text inside that height
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: colors.chipBackground,
      marginRight: 8,
    },
    chipActive: {
      backgroundColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.chipText,
    },
    chipTextActive: {
      color: '#FFFFFF',
    },
  });
}