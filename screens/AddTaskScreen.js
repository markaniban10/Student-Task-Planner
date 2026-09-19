// screens/AddTaskScreen.js
//
// A form screen: text inputs for title/subject/notes, a native DATE PICKER
// for the deadline, and a Save button. Demonstrates "controlled inputs" —
// the standard React pattern where each field's value is driven by state.
//
// Why a date picker instead of a text field:
// Previously the deadline was free-typed text, checked against a regex
// (`/^\d{4}-\d{2}-\d{2}$/`) — easy to mistype (e.g. "2026-2-5"), and it
// required the user to know our exact expected format. A native picker
// removes that failure mode entirely: whatever the user selects is always
// already a valid, real calendar date.

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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { formatDeadline, toDateInputString } from '../utils/dateHelpers';

export default function AddTaskScreen({ navigation }) {
  const { dispatch } = useTasks();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Each field gets its own piece of state. Simpler than one big object for
  // a small form like this, and it makes each <TextInput> trivial to wire up.
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');

  // --- Deadline state ---
  // `deadlineDate` is a real JS Date object — what the picker natively works
  // with. We only convert it to our "YYYY-MM-DD" storage string at the very
  // end, in handleSave (via toDateInputString in dateHelpers.js). Defaulting
  // to `new Date()` means the field is never empty/invalid — there's always
  // a valid date sitting there even before the user touches it.
  const [deadlineDate, setDeadlineDate] = useState(new Date());
  // Controls whether the native picker UI is currently visible. We open it
  // by pressing the field below, instead of it always being on-screen.
  const [showPicker, setShowPicker] = useState(false);

  // Fires when the user picks a date (or dismisses the picker, on Android).
  const handleDateChange = (event, selectedDate) => {
    // On Android, the picker is a popup dialog that closes itself — we hide
    // our `showPicker` state to match. On iOS it's inline/spinner-style and
    // stays open until the user taps away, so we leave `showPicker` as-is.
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    // `selectedDate` is undefined if the user cancelled — don't overwrite
    // the existing value in that case.
    if (selectedDate) {
      setDeadlineDate(selectedDate);
    }
  };

  const handleSave = () => {
    // --- Basic validation before writing to global state ---
    // Deadline no longer needs validating here — the picker guarantees a
    // real date — so we only check the two free-text fields.
    if (title.trim() === '' || subject.trim() === '') {
      Alert.alert('Missing info', 'Please fill in title and subject.');
      return;
    }

    const newTask = {
      id: Date.now().toString(), // quick unique id for a prototype (timestamp)
      title: title.trim(),
      subject: subject.trim(),
      deadline: toDateInputString(deadlineDate), // Date -> "YYYY-MM-DD"
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
            placeholderTextColor={colors.subtext}
            value={title}
            onChangeText={setTitle} // fires on every keystroke
          />

          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Networking"
            placeholderTextColor={colors.subtext}
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.label}>Deadline</Text>
          {/* This TouchableOpacity LOOKS like the old text input (same
              styling), but instead of a keyboard it opens the native date
              picker when pressed. */}
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.dateText}>{formatDeadline(toDateInputString(deadlineDate))}</Text>
          </TouchableOpacity>

          {/* The picker only renders while `showPicker` is true. Rendering
              it conditionally (rather than always rendering it hidden) is
              the standard pattern for this component. */}
          {showPicker && (
            <DateTimePicker
              value={deadlineDate}
              mode="date"
              // "default" gives each platform its native look: a calendar
              // dialog on Android, an inline spinner/wheel on iOS.
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Extra details..."
            placeholderTextColor={colors.subtext}
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

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    form: {
      padding: 20,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.subtext,
      marginTop: 14,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
    },
    dateText: {
      fontSize: 15,
      color: colors.text,
    },
    notesInput: {
      minHeight: 80,
      textAlignVertical: 'top', // Android: start multiline text at the top
    },
    saveButton: {
      backgroundColor: colors.primary,
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
      color: colors.subtext,
      fontWeight: '600',
      fontSize: 14,
    },
  });
}