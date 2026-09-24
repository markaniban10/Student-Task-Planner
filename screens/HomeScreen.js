// screens/HomeScreen.js
//
// This is the app's main screen. Its jobs are:
//   1. Read the global task list from context (useTasks)
//   2. Let the user filter by subject (SubjectFilterBar)
//   3. Sort the filtered tasks by deadline (soonest first)
//   4. Render them efficiently with FlatList
//   5. Let the user toggle completion, open a task's details, or add a new one
//   6. Let the user flip light/dark mode from a button in the header
//   7. Let the user long-press a task to enter SELECTION MODE: pick several
//      tasks, Select All / Deselect All, then Mark as Done or Delete them
//      all in one action

import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { sortTasksByDeadline } from '../utils/dateHelpers';
import TaskCard from '../components/TaskCard';
import SubjectFilterBar from '../components/SubjectFilterBar';

export default function HomeScreen({ navigation }) {
  const { tasks, dispatch } = useTasks();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = getStyles(colors);

  const [selectedSubject, setSelectedSubject] = useState('All');

  // --- Selection mode state ---
  // `selectionMode` flips on the moment any task is long-pressed. `selectedIds`
  // is a Set (not an array) because checking "is this id in here?" and
  // adding/removing one id are both instant with a Set, vs. searching a
  // whole array every time — matters once tasks/selections grow.
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const subjects = useMemo(() => {
    return [...new Set(tasks.map((t) => t.subject))];
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const filtered =
      selectedSubject === 'All'
        ? tasks
        : tasks.filter((t) => t.subject === selectedSubject);
    return sortTasksByDeadline(filtered);
  }, [tasks, selectedSubject]);

  // --- Regular (non-selection) handlers ---
  const handleToggle = (taskId) => {
    dispatch({ type: 'TOGGLE_TASK', payload: { id: taskId } });
  };

  const handleOpenTask = (task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  // --- Selection-mode handlers ---

  // Toggles ONE task's membership in the selectedIds set. We always build a
  // NEW Set (never mutate `previous` directly) so React reliably detects the
  // state changed — the same "return something new" rule TaskContext uses.
  const handleToggleSelect = (taskId) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // A long-press either STARTS selection mode (nothing selected yet) or, if
  // selection mode is already running, behaves like a normal tap on that
  // task (toggle it).
  const handleLongPressTask = (taskId) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIds(new Set([taskId]));
    } else {
      handleToggleSelect(taskId);
    }
  };

  // "Select All" only ever refers to the tasks currently VISIBLE (i.e.
  // respecting the active subject filter) — selecting "All" while filtered
  // to "CS 301" shouldn't silently also select tasks from other subjects
  // the user can't even see right now.
  const allVisibleSelected =
    visibleTasks.length > 0 && visibleTasks.every((t) => selectedIds.has(t.id));

  const handleSelectAllToggle = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleTasks.map((t) => t.id)));
    }
  };

  const handleExitSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleMarkAllDone = () => {
    dispatch({ type: 'COMPLETE_TASKS', payload: { ids: Array.from(selectedIds) } });
    handleExitSelection();
  };

  const handleDeleteAll = () => {
    const count = selectedIds.size;
    Alert.alert(
      'Delete tasks?',
      `${count} task${count === 1 ? '' : 's'} will be removed permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'DELETE_TASKS', payload: { ids: Array.from(selectedIds) } });
            handleExitSelection();
          },
        },
      ]
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  // FlatList normally only re-renders a row when the ITEM data changes.
  // Selecting a task doesn't change `visibleTasks` at all — it's separate
  // state — so without `extraData`, FlatList wouldn't know to re-render
  // rows when selection changes. Passing a value here that changes whenever
  // selection does forces it to.
  const selectionExtraData = `${selectionMode}-${Array.from(selectedIds).sort().join(',')}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {selectionMode ? (
        // --- Selection-mode header (replaces the normal header) ---
        <View style={styles.selectionHeader}>
          <View style={styles.selectionTopRow}>
            <TouchableOpacity onPress={handleExitSelection} style={styles.selectionCloseButton}>
              <Text style={styles.selectionCloseIcon}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.selectionCount}>{selectedIds.size} selected</Text>

            <TouchableOpacity onPress={handleSelectAllToggle}>
              <Text style={styles.selectAllText}>
                {allVisibleSelected ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bulk-action buttons only appear once at least one task is
              checked — nothing to "mark done" or "delete" with zero picked. */}
          {selectedIds.size > 0 && (
            <View style={styles.selectionActionsRow}>
              <TouchableOpacity style={styles.selectionActionButton} onPress={handleMarkAllDone}>
                <Text style={styles.selectionActionText}>✓ Mark as Done</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.selectionActionButton, styles.selectionDeleteButton]}
                onPress={handleDeleteAll}
              >
                <Text style={[styles.selectionActionText, styles.selectionDeleteText]}>
                  🗑 Delete
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        // --- Normal header ---
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Tasks</Text>
            <Text style={styles.headerSubtitle}>
              {completedCount} of {tasks.length} completed
            </Text>
          </View>

          <TouchableOpacity
            style={styles.themeToggle}
            onPress={toggleTheme}
            accessibilityLabel="Toggle dark mode"
          >
            <Text style={styles.themeToggleIcon}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <SubjectFilterBar
        subjects={subjects}
        selected={selectedSubject}
        onSelect={setSelectedSubject}
      />

      <FlatList
        data={visibleTasks}
        keyExtractor={(item) => item.id}
        extraData={selectionExtraData}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={handleToggle}
            onPress={handleOpenTask}
            selectionMode={selectionMode}
            isSelected={selectedIds.has(item.id)}
            onLongPress={handleLongPressTask}
            onToggleSelect={handleToggleSelect}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No tasks in "{selectedSubject}". Tap + to add one.
          </Text>
        }
      />

      {/* The FAB is hidden during selection mode — tapping it to add a task
          while trying to bulk-edit existing ones would be confusing, and it
          would sit awkwardly under the selection action buttons anyway. */}
      {!selectionMode && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddTask')}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 4,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 13,
      color: colors.subtext,
      marginTop: 2,
    },
    themeToggle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeToggleIcon: {
      fontSize: 18,
    },
    // --- Selection-mode header styles ---
    selectionHeader: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    selectionTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectionCloseButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectionCloseIcon: {
      fontSize: 18,
      color: colors.text,
    },
    selectionCount: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    selectAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    selectionActionsRow: {
      flexDirection: 'row',
      marginTop: 10,
    },
    selectionActionButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: 'center',
      marginRight: 8,
    },
    selectionActionText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 13,
    },
    selectionDeleteButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.danger,
      marginRight: 0,
    },
    selectionDeleteText: {
      color: colors.danger,
    },
    listContent: {
      paddingBottom: 100,
      flexGrow: 1,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.subtext,
      marginTop: 40,
      fontSize: 14,
    },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 28,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 5,
    },
    fabText: {
      color: '#FFFFFF',
      fontSize: 30,
      fontWeight: '400',
      marginTop: -2,
    },
  });
}