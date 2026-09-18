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
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function SubjectFilterBar({ subjects, selected, onSelect }) {
  // We always show "All" first, then every unique subject found in the data.
  const chips = ['All', ...subjects];

  return (
    <ScrollView
      horizontal // scroll sideways instead of the default vertical
      showsHorizontalScrollIndicator={false}
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
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {subject}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', // ScrollView's content also needs row direction
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#0F6A45',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
