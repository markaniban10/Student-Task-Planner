// components/TaskCard.js
//
// This is a "presentational" component: it receives data and callback
// functions via PROPS and just renders UI — it doesn't know where the data
// came from or what happens when you press it.
//
// Props this component expects:
//   task           -> the task object {id, title, subject, deadline, completed, notes}
//   onToggle       -> call when the checkbox is pressed OUTSIDE selection mode
//                      (marks this one task complete/incomplete)
//   onPress        -> call when the card is pressed OUTSIDE selection mode
//                      (navigates to the detail screen)
//   selectionMode  -> true once the user has long-pressed any task in the list
//   isSelected     -> whether THIS task is currently checked for a bulk action
//   onLongPress    -> call on long-press (starts or extends selection)
//   onToggleSelect -> call to check/uncheck this task WHILE selectionMode is true

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDeadline, getDeadlineLabel } from '../utils/dateHelpers';
import { useTheme } from '../context/ThemeContext';

export default function TaskCard({
  task,
  onToggle,
  onPress,
  selectionMode,
  isSelected,
  onLongPress,
  onToggleSelect,
}) {
  const { label, status } = getDeadlineLabel(task.deadline);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // A short tap does different things depending on mode: normally it opens
  // the detail screen, but once selection mode is active, taps just
  // check/uncheck the task instead — the whole point of selection mode is
  // that ordinary navigation is paused until the user exits it.
  const handlePress = () => {
    if (selectionMode) {
      onToggleSelect(task.id);
    } else {
      onPress(task);
    }
  };

  // The checkbox circle does double duty: outside selection mode it marks a
  // single task done/not-done (its original job); inside selection mode it
  // becomes just another way to check/uncheck the task, matching the rest
  // of the card.
  const handleCheckboxPress = () => {
    if (selectionMode) {
      onToggleSelect(task.id);
    } else {
      onToggle(task.id);
    }
  };

  // Long-pressing always reports up to HomeScreen, which decides what that
  // means: if nothing is selected yet, it STARTS selection mode with this
  // task; if selection mode is already running, it just toggles this task
  // the same as a tap would.
  const handleLongPress = () => {
    onLongPress(task.id);
  };

  // What the leading circle shows: normally it reflects `completed`, but
  // while selecting, it reflects `isSelected` instead, so the user can see
  // at a glance which tasks are currently picked for the bulk action.
  const circleFilled = selectionMode ? isSelected : task.completed;

  return (
    <TouchableOpacity
      style={[styles.card, selectionMode && isSelected && styles.cardSelected]}
      activeOpacity={0.7}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={350} // ms to hold before it counts as a long-press
    >
      {/* --- Checkbox / selection-indicator column --- */}
      <TouchableOpacity
        style={[styles.checkbox, circleFilled && styles.checkboxChecked]}
        onPress={handleCheckboxPress}
      >
        {circleFilled && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      {/* --- Text column: takes up the remaining space (flex: 1) --- */}
      <View style={styles.textColumn}>
        <Text
          style={[styles.title, task.completed && styles.titleCompleted]}
          numberOfLines={1}
        >
          {task.title}
        </Text>

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

function getStyles(colors) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginHorizontal: 16,
      marginVertical: 6,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      // Selected cards get a border below — defined separately so it only
      // applies conditionally (see cardSelected).
      borderWidth: 2,
      borderColor: 'transparent',
    },
    cardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    checkbox: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
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
      flex: 1,
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
      flexWrap: 'wrap',
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