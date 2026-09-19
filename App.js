// App.js
//
// This is the ENTRY POINT of the whole app — the file Expo/React Native
// runs first. Its only jobs are to set up the things every screen needs
// access to:
//   1. ThemeProvider  -> light/dark color scheme (see context/ThemeContext.js)
//   2. TaskProvider   -> the shared task data (see context/TaskContext.js)
//   3. NavigationContainer + Stack.Navigator -> lets screens move between
//      each other (see screens/*.js)
//
// Everything below is essentially "wiring," not business logic — the real
// logic lives in the contexts and the individual screens.

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import HomeScreen from './screens/HomeScreen';
import AddTaskScreen from './screens/AddTaskScreen';
import TaskDetailScreen from './screens/TaskDetailScreen';

// A "Stack Navigator" manages screens like a stack of cards: navigating
// PUSHES a new screen on top (with a back button/gesture provided
// automatically), and going back POPS it off.
const Stack = createNativeStackNavigator();

// Navigation is pulled out into its own component (instead of living
// directly inside App()) for one reason: useTheme() can only be called
// from a component that renders INSIDE <ThemeProvider>. App() itself
// renders the ThemeProvider, so App() can't call useTheme() on itself —
// Navigation, rendered as a CHILD of ThemeProvider below, can.
function Navigation() {
  const { colors } = useTheme();

  return (
    <>
      {/* StatusBar's icon color (clock/battery/etc.) needs to flip too —
          dark icons are invisible on a dark background. colors.statusBarStyle
          is 'dark' or 'light' per theme, set in ThemeContext.js. */}
      <StatusBar style={colors.statusBarStyle} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: '700' },
            // Colors the empty space behind each screen during transitions,
            // so switching screens doesn't flash the wrong theme's color.
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }} // HomeScreen draws its own header
          />
          <Stack.Screen
            name="AddTask"
            component={AddTaskScreen}
            options={{ title: 'Add Task' }}
          />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
            options={{ title: 'Task Details' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    // SafeAreaProvider lets every screen know the size of notches/status
    // bars so content isn't drawn underneath them.
    <SafeAreaProvider>
      {/* ThemeProvider goes OUTSIDE TaskProvider — theme has nothing to do
          with task data, but both need to be above Navigation so every
          screen, at any depth, can reach them. Order between the two
          providers doesn't functionally matter here since neither reads
          from the other. */}
      <ThemeProvider>
        <TaskProvider>
          <Navigation />
        </TaskProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}