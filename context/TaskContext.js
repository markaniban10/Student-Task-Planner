// context/TaskContext.js
//
// ============================================================================
// WHY THIS FILE EXISTS (important for the Q&A defense!)
// ============================================================================
// Our app has multiple screens: HomeScreen (shows the list), AddTaskScreen
// (creates a new task), and TaskDetailScreen (toggles/deletes one task).
// All three screens need to read and change the SAME list of tasks.
//
// If we only used useState() inside HomeScreen, AddTaskScreen would have no
// way to add a task to that list — screens don't share local state with each
// other by default. The React fix for "many components need the same data"
// is called "lifting state up," and when the components aren't directly
// nested (they're separate screens reached via navigation), the cleanest way
// to lift state up is with React's Context API + useReducer.
//
//   - useReducer  -> manages the tasks array itself and the rules for how it
//                     is allowed to change (add / toggle / delete). This is
//                     the same pattern Redux uses, just built into React.
//   - Context     -> makes that state available to ANY screen in the app
//                     without manually passing props down through every
//                     level ("prop drilling").
// ============================================================================

import React, { createContext, useReducer, useContext } from 'react';
import sampleTasks from '../data/sampleTasks';

// createContext() makes a "channel" that any descendant component can tune
// into with useContext(). The default value (null) is only used if a
// component tries to read the context outside of the Provider below.
const TaskContext = createContext(null);

// The REDUCER is a pure function: (currentState, action) => newState.
// It's the single place in the whole app where task data is allowed to
// change, which makes the app's behavior predictable and easy to explain:
// "if you want to know every way tasks can change, read this one function."
function taskReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK': {
      // action.payload is the new task object built in AddTaskScreen.
      // We return a NEW array (using the spread operator ...state) instead
      // of pushing into the old one — React relies on detecting a new array
      // reference to know it needs to re-render.
      return [...state, action.payload];
    }

    case 'TOGGLE_TASK': {
      // .map() walks every task; for the one matching the id we flip
      // `completed`, and for every other task we return it unchanged.
      // This is how we "mark as complete" without mutating state directly.
      return state.map((task) =>
        task.id === action.payload.id
          ? { ...task, completed: !task.completed }
          : task
      );
    }

    case 'DELETE_TASK': {
      // .filter() keeps every task EXCEPT the one whose id matches.
      return state.filter((task) => task.id !== action.payload.id);
    }

    default:
      // Always return state unchanged for an action type we don't recognize.
      return state;
  }
}

// TaskProvider wraps the whole app (we do this once, in App.js) and supplies
// the current `tasks` array plus the `dispatch` function to every screen
// nested inside it.
export function TaskProvider({ children }) {
  const [tasks, dispatch] = useReducer(taskReducer, sampleTasks);

  return (
    <TaskContext.Provider value={{ tasks, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

// useTasks is a small custom hook so screens can write:
//   const { tasks, dispatch } = useTasks();
// instead of importing useContext and TaskContext separately every time.
export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    // This error fires if a screen calls useTasks() but isn't rendered
    // inside <TaskProvider>. It's a helpful guardrail during development.
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
