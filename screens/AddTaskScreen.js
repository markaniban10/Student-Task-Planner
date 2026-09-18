// screens/AddTaskScreen.js
//
// A form screen: three TextInputs (title, subject, deadline) and a Save
// button. Demonstrates "controlled inputs" — the standard React pattern
// where each TextInput's value is driven by state, and every keystroke
// updates that state via onChangeText. This is what "simulated
// interactivity" / "UI responds to user input" means in the rubric.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks } from '../context/TaskContext';

export default function AddTaskScreen({ navigation }) {
  const { dispatch } = useTasks();

  // Each field gets its own piece of state. Simpler than one big object for
  // a small form like this, and it makes each <TextInput> trivial to wire up.
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [deadline, setDeadline] = useState(''); // expects YYYY-MM-DD
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    // --- Basic validation before writing to global state ---
    if (title.trim() === '' || subject.trim() === '' || deadline.trim() === '') {
      Alert.alert('Missing info', 'Please fill in title, subject, and deadline.');
      return;
    }
    // A light regex check that the date roughly matches YYYY-MM-DD, so a
    // typo doesn't silently break the sorting logic in dateHelpers.js.
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(deadline.trim());
    if (!validDate) {
      Alert.alert('Invalid date', 'Please enter the deadline as YYYY-MM-DD.');
      return;
    }

    const newTask = {
      id: Date.now().toString(), // quick unique id for a prototype (timestamp)
      title: title.trim(),
      subject: subject.trim(),
      deadline: deadline.trim(),
      notes: notes.trim(),
      completed: false,
    };

    dispatch({ type: 'ADD_TASK', payload: newTask });

    // Return to HomeScreen. Because HomeScreen reads `tasks` from the same
    // context we just dispatched to, it re-renders automatically with the
    // new task included — no manual refresh needed.
    navigation.goBack();
  };

  return (
    // KeyboardAvoidingView pushes the form up when the on-screen keyboard
    // opens, so the input being typed into isn't hidden behind it.
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.form}>
          <Text style={styles.label}>Task Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Finish HCI Report"
            value={title}
            onChangeText={setTitle} // fires on every keystroke
          />

          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Networking"
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.label}>Deadline (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2026-10-05"
            value={deadline}
            onChangeText={setDeadline}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Extra details..."
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Task</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top', // Android: start multiline text at the top
  },
  saveButton: {
    backgroundColor: '#0F6A45',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
});
