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
import { useTheme } from '../context/ThemeContext';

export default function TaskCard({ task, onToggle, onPress }) {
  const { label, status } = getDeadlineLabel(task.deadline);

  // useTheme() gives us the current color palette (light or dark). We build
  // the StyleSheet from it below — this is the only thing dark mode changes
  // in this file; every layout rule stays exactly as it was.
  const { colors } = useTheme();
  const styles = getStyles(colors);

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
          <Text style={[styles.deadlineText, deadlineColor(status, colors)]}>
            {label} · {formatDeadline(task.deadline)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Returns a small style object based on urgency, so overdue tasks show red
// and comfortably-far-away tasks show a neutral gray. Now takes `colors` so
// the "neutral" gray is the right shade for the current theme too.
function deadlineColor(status, colors) {
  switch (status) {
    case 'overdue':
      return { color: colors.danger };
    case 'today':
    case 'soon':
      return { color: colors.warning };
    default:
      return { color: colors.subtext };
  }
}

// ============================================================================
// STYLESHEET — this is where the Flexbox layout lives.
// ============================================================================
// This is now a FUNCTION of `colors` instead of a plain object, so it's
// rebuilt every render with whichever palette is currently active. For a
// list this small that's cheap; for a huge list you'd memoize it with
// useMemo(() => getStyles(colors), [colors]) instead. Every layout property
// (flexDirection, padding, borderRadius, etc.) is identical to before —
// only the color values now come from the `colors` parameter.
function getStyles(colors) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row', // lay children left-to-right
      alignItems: 'center', // vertically center checkbox + text
      backgroundColor: colors.surface,
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
      borderColor: colors.primary,
      alignItems: 'center', // center the checkmark horizontally
      justifyContent: 'center', // center the checkmark vertically
      marginRight: 12,
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
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
      color: colors.text,
      marginBottom: 6,
    },
    titleCompleted: {
      textDecorationLine: 'line-through',
      color: colors.subtext,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap', // allow the pill + date to wrap on narrow screens
    },
    subjectPill: {
      backgroundColor: colors.primaryLight,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginRight: 8,
    },
    subjectPillText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
    },
    deadlineText: {
      fontSize: 12,
      fontWeight: '500',
    },
  });
}