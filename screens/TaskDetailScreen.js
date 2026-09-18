// screens/TaskDetailScreen.js
//
// Demonstrates reading a ROUTE PARAM (route.params.taskId, sent by
// HomeScreen's navigation.navigate('TaskDetail', {taskId})) and using it to
// look up the full task object from context. Also shows toggling and
// deleting a task from a second screen — proof that our shared TaskContext
// really does work across the whole navigation stack, not just one screen.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks } from '../context/TaskContext';
import { formatDeadline, getDeadlineLabel } from '../utils/dateHelpers';

export default function TaskDetailScreen({ route, navigation }) {
  // `route.params` is how React Navigation passes data between screens.
  const { taskId } = route.params;
  const { tasks, dispatch } = useTasks();

  // Find the specific task this screen should display. Because `tasks`
  // comes from context (shared, "live" state), if the task is toggled or
  // deleted, this screen automatically re-renders with the updated data.
  const task = tasks.find((t) => t.id === taskId);

  // Defensive check: if the task was deleted while this screen is still
  // technically mounted (e.g. mid-transition), avoid crashing on `task.title`.
  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.missingText}>This task no longer exists.</Text>
      </SafeAreaView>
    );
  }

  const { label, status } = getDeadlineLabel(task.deadline);

  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_TASK', payload: { id: task.id } });
  };

  const handleDelete = () => {
    // Alert.alert with two buttons is React Native's built-in confirmation
    // dialog — a simple way to prevent accidental deletes.
    Alert.alert('Delete task?', `"${task.title}" will be removed permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'DELETE_TASK', payload: { id: task.id } });
          navigation.goBack(); // return to HomeScreen after deleting
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.subjectPill}>
          <Text style={styles.subjectPillText}>{task.subject}</Text>
        </View>

        <Text style={styles.title}>{task.title}</Text>

        <Text style={[styles.deadline, statusColor(status)]}>
          {label} · {formatDeadline(task.deadline)}
        </Text>

        {task.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{task.notes}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.actionButton, task.completed && styles.actionButtonUndo]}
          onPress={handleToggle}
        >
          <Text style={styles.actionButtonText}>
            {task.completed ? 'Mark as Not Done' : 'Mark as Complete'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Task</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function statusColor(status) {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  content: {
    padding: 20,
  },
  missingText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#9CA3AF',
  },
  subjectPill: {
    alignSelf: 'flex-start', // pill only as wide as its text, not full row
    backgroundColor: '#E6F4EC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  subjectPillText: {
    color: '#0F6A45',
    fontWeight: '600',
    fontSize: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  deadline: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
  },
  notesBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#0F6A45',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonUndo: {
    backgroundColor: '#6B7280',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  deleteButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D64545',
  },
  deleteButtonText: {
    color: '#D64545',
    fontWeight: '700',
    fontSize: 14,
  },
});
