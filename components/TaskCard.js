// components/TaskCard.js
//
// This is a "presentational" component: it receives data and callback
// functions via PROPS and just renders UI — it doesn't know where the data
// came from or what happens when you press it. That separation (TaskCard
// doesn't import TaskContext itself) makes it reusable and easy to test.
//
// Props this component expects:
//   task     -> the task object {id, title, subject, deadline, completed, notes}
//   onToggle -> function to call when the checkbox circle is pressed
//   onPress  -> function to call when the card itself is pressed (navigates
//               to the detail screen)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDeadline, getDeadlineLabel } from '../utils/dateHelpers';

export default function TaskCard({ task, onToggle, onPress }) {
  const { label, status } = getDeadlineLabel(task.deadline);

  return (
    // The whole card is wrapped in TouchableOpacity so tapping ANYWHERE on
    // it (except the checkbox, which stops the tap from bubbling — see
    // below) navigates to the task's detail screen.
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress(task)}
    >
      {/* --- Checkbox column --- */}
      <TouchableOpacity
        style={[styles.checkbox, task.completed && styles.checkboxChecked]}
        onPress={() => onToggle(task.id)}
      >
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      {/* --- Text column: takes up the remaining space (flex: 1) --- */}
      <View style={styles.textColumn}>
        <Text
          style={[styles.title, task.completed && styles.titleCompleted]}
          numberOfLines={1}
        >
          {task.title}
        </Text>

        {/* This row uses Flexbox's row direction to place the subject
            "pill" and the deadline label side-by-side. */}
        <View style={styles.metaRow}>
          <View style={styles.subjectPill}>
            <Text style={styles.subjectPillText}>{task.subject}</Text>
          </View>
          <Text style={[styles.deadlineText, deadlineColor(status)]}>
            {label} · {formatDeadline(task.deadline)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Returns a small style object based on urgency, so overdue tasks show red
// and comfortably-far-away tasks show a neutral gray.
function deadlineColor(status) {
  switch (status) {
    case 'overdue':
      return { color: '#D64545' };
    case 'today':
    case 'soon':
      return { color: '#C98A1B' };
    default:
      return { color: '#6B7280' };
  }
}

// ============================================================================
// STYLESHEET — this is where the Flexbox layout lives.
// ============================================================================
// React Native doesn't use CSS files; StyleSheet.create() is the RN
// equivalent. Every View defaults to `display: flex` already (unlike the
// web, where you must opt in), and `flexDirection` defaults to 'column'
// (unlike the web's default 'row'). That default-column behavior is why
// `card` below only needs `flexDirection: 'row'` explicitly — we're
// overriding the default to lay the checkbox and text side-by-side.
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', // lay children left-to-right
    alignItems: 'center', // vertically center checkbox + text
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    // Simple shadow so cards visually separate from the background.
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // Android's equivalent of shadow
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#0F6A45',
    alignItems: 'center', // center the checkmark horizontally
    justifyContent: 'center', // center the checkmark vertically
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#0F6A45',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  textColumn: {
    flex: 1, // take up all remaining horizontal space in the row
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', // allow the pill + date to wrap on narrow screens
  },
  subjectPill: {
    backgroundColor: '#E6F4EC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  subjectPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F6A45',
  },
  deadlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
