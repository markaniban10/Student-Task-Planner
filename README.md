# Student Task & Assignment Planner

A React Native (Expo) prototype that lets a student track assignments:
sort by deadline, group/filter by subject, and toggle completion.

---

## 1. Project structure

```
StudentPlanner/
├── App.js                      # entry point: navigation + context setup
├── package.json
├── context/
│   └── TaskContext.js          # global state (useReducer + Context API)
├── data/
│   └── sampleTasks.js          # starter/seed data
├── utils/
│   └── dateHelpers.js          # sorting + date-formatting functions
├── components/
│   ├── TaskCard.js             # one row in the task list (Flexbox layout)
│   └── SubjectFilterBar.js     # horizontal subject filter chips
└── screens/
    ├── HomeScreen.js           # task list (FlatList), filter, FAB
    ├── AddTaskScreen.js        # form to create a task
    └── TaskDetailScreen.js     # view / toggle / delete one task
```

## 2. How to run it

1. Install Expo CLI tooling (only once): `npm install -g expo-cli` (optional —
   `npx expo` also works without a global install).
2. From inside this folder: `npm install`
3. Start the dev server: `npx expo start`
4. Scan the QR code with the **Expo Go** app on your phone, or press `a`/`i`
   in the terminal to launch an Android/iOS emulator.

---

## 3. How this maps to the rubric

### UI Design & Flexbox Layout (10%)
- Every `View` in React Native is a flex container by default. `TaskCard.js`
  sets `flexDirection: 'row'` on the card so the checkbox and text sit
  side-by-side, and `flex: 1` on the text column so it fills the remaining
  space regardless of screen width.
- `SubjectFilterBar.js` uses a horizontal `ScrollView` with `flexDirection: 'row'`
  so subject chips wrap around any number of subjects without breaking layout.
- Core components used: `View`, `Text`, `TouchableOpacity`, `TextInput`,
  `ScrollView`, `FlatList`, `SafeAreaView`.

### Screen Navigation (20%)
- `App.js` sets up a `Stack.Navigator` with three screens: `Home`, `AddTask`,
  `TaskDetail`. React Navigation manages the back-stack automatically (back
  button/gesture appears on pushed screens).
- Data is passed between screens with **route params**
  (`navigation.navigate('TaskDetail', { taskId })`), not global variables.

### Simulated Interactivity (20%)
- **Buttons:** the checkbox circle in `TaskCard`, the `+` FAB, Save/Cancel in
  `AddTaskScreen`, Mark-Complete/Delete in `TaskDetailScreen`.
- **Text inputs:** all four fields in `AddTaskScreen` are *controlled inputs*
  — their value comes from `useState`, and `onChangeText` updates that state
  on every keystroke.
- **Scrollable list:** `HomeScreen` renders tasks with `FlatList`, which only
  mounts the rows currently on-screen (more efficient than `ScrollView` +
  `.map()` for a list that can grow).
- Every interaction updates real state and the UI reflects it immediately
  (checkbox fills in, strikethrough appears, list re-sorts, new task appears).


### Dark Mode & Date Picker (added after initial defense)
- **Dark mode:** `context/ThemeContext.js` holds two color palettes
  (`lightColors` / `darkColors`) behind a `ThemeProvider`, following the exact
  same Context + custom-hook pattern as `TaskContext.js`. Every screen and
  component reads colors via `useTheme()` instead of hardcoding hex values,
  so toggling the button in the top-right corner of `HomeScreen` (🌙/☀️)
  re-themes the entire app instantly — no screen needs to know dark mode
  exists beyond calling the hook.
- **Date picker:** `AddTaskScreen.js` now uses
  `@react-native-community/datetimepicker` instead of a free-typed
  `YYYY-MM-DD` text field. This removes an entire class of bugs (typos,
  wrong format, impossible dates like `2026-13-40`) since the picker only
  ever returns a real, valid `Date`. `utils/dateHelpers.js` gained one small
  pure function, `toDateInputString()`, to convert that `Date` back into the
  `"YYYY-MM-DD"` string the rest of the app (sorting, storage) already
  expects.


### Technical Defense & Q&A (50%)
See the "Likely Q&A" section below — every answer points to a specific file
and line of logic so you can explain it confidently.

---

## 4. Likely Q&A — talking points

**Q: How does sorting by deadline work?**
`utils/dateHelpers.js` → `sortTasksByDeadline()`. It copies the array with
`.slice()` (so we never mutate the original), then `.sort()` compares two
tasks by subtracting their `Date` objects — JavaScript converts dates to
milliseconds-since-epoch for subtraction, so the smallest (soonest) date
sorts first. This is called from `HomeScreen.js` inside a `useMemo`, so it
only re-runs when `tasks` or the selected subject filter changes.

**Q: How are tasks categorized by subject?**
`HomeScreen.js` builds a unique subject list with
`[...new Set(tasks.map(t => t.subject))]`, passes it to `SubjectFilterBar`,
and filters `tasks` down with `.filter(t => t.subject === selectedSubject)`
before sorting.

**Q: How does toggling completion work, and why doesn't it break?**
Every task lives in one array inside `TaskContext.js`, managed by
`useReducer`. The `TOGGLE_TASK` action uses `.map()` to return a **new**
array where only the matching task has `completed` flipped
(`{...task, completed: !task.completed}`); every other task is returned
unchanged. Returning a new array (not mutating the old one) is what tells
React "something changed, please re-render."

**Q: Why Context + useReducer instead of just useState in HomeScreen?**
Three separate screens (Home, AddTask, TaskDetail) all need to read and
change the same task list. `useState` inside one screen isn't visible to
another screen — they're not parent/child, they're siblings reached through
navigation. Context makes the state available anywhere in the tree without
manually passing it through every screen's props ("prop drilling"), and
`useReducer` centralizes every possible state change (add/toggle/delete)
into one function (`taskReducer`) so the rules for how data changes live in
exactly one place.

**Q: What's the difference between `state` and `props` in this app?**
Props are read-only data passed INTO a component by its parent (e.g. `task`
passed into `TaskCard`). State is data a component (or, here, the Context
provider) owns and can change over time (e.g. the `tasks` array, or
`selectedSubject` in `HomeScreen`). `TaskCard` never changes `task` directly;
it calls the `onToggle` prop function, which is really `dispatch()` from
context — the change happens "up" in the owner of the state, not locally.

**Q: How does React Navigation pass data between screens?**
Via **route params**. `HomeScreen` calls
`navigation.navigate('TaskDetail', { taskId: task.id })`. `TaskDetailScreen`
reads it back with `route.params.taskId`, then looks the full task object up
from the shared context (`tasks.find(t => t.id === taskId)`). We pass just
the `id`, not the whole object, so the detail screen always shows the
current live data even if it changed after navigating.

**Q: What happens if I add a task with an invalid date?**
`AddTaskScreen.js`'s `handleSave` validates with a regex
(`/^\d{4}-\d{2}-\d{2}$/`) before dispatching `ADD_TASK`; if it fails, an
`Alert` is shown and nothing is added, protecting the sorting logic
downstream from crashing on a malformed date.

**Q: Why does `TaskCard` not import `useTasks()` itself?**
It's a "presentational" component — it only knows how to *display* a task
and call the functions it's given (`onToggle`, `onPress`). This keeps it
reusable and easy to reason about in isolation; all the "where does this
data live" logic stays in `HomeScreen`/context.

**Q: How would you extend this app?**
Persist tasks with `AsyncStorage` (React Native's key-value local storage) so
they survive an app restart, add push notifications for approaching
deadlines, or swap the seed data for a real backend API call inside
`TaskProvider`'s initial state.

**Q: How does dark mode work across the whole app without passing props everywhere?**
Same idea as `TaskContext` — `ThemeContext.js` wraps the app in `App.js` with
a `ThemeProvider`, storing `isDark` in `useState` and deriving a `colors`
object from it. Any screen calls `useTheme()` to get `{ colors, isDark,
toggleTheme }`. Styles were converted from static `StyleSheet.create({...})`
objects into `getStyles(colors)` functions, so they're rebuilt with the
correct palette every time the theme changes.

**Q: Why switch from a text input to a date picker for the deadline?**
A typed date can't be validated for "is this a real, sensible date" beyond a
regex shape check — `2026-02-30` passes `/^\d{4}-\d{2}-\d{2}$/` but doesn't
exist. `@react-native-community/datetimepicker` opens the OS's native
calendar UI, so the value is guaranteed to be a real date the moment the user
picks it, eliminating that validation step entirely.