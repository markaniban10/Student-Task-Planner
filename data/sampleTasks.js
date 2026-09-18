// data/sampleTasks.js
//
// This file is our "seed" data — a small starting set of tasks so the app
// isn't empty the first time it runs. In a real app this would eventually
// come from a database or API, but for a prototype/defense project, static
// sample data is the simplest way to demonstrate the UI working correctly.
//
// Each task is a plain JavaScript OBJECT with 6 fields (properties):
//   id        -> string, a unique identifier (FlatList needs this to track items)
//   title     -> string, what the task/assignment is
//   subject   -> string, used for categorizing/filtering (e.g. "Math")
//   deadline  -> string in "YYYY-MM-DD" format, used for sorting
//   notes     -> string, optional extra detail shown on the detail screen
//   completed -> boolean, true/false — this is what the checkbox toggles

// data/sampleTasks.js
//
// This file is our "seed" data — a small starting set of tasks so the app
// isn't empty the first time it runs.

const sampleTasks = [
  {
    id: '1',
    title: 'Defense in CS301',
    subject: 'CS 301',
    deadline: '2026-09-21',
    notes: '',
    completed: false,
  },
  {
    id: '2',
    title: 'MCO in Visual Arts',
    subject: 'Visual Arts',
    deadline: '2026-09-24',
    notes: '',
    completed: false,
  },
  {
    id: '3',
    title: 'Report in CS 301',
    subject: 'CS 301',
    deadline: '2026-09-25',
    notes: '',
    completed: false,
  },
  {
    id: '4',
    title: 'FINAL Examination',
    subject: 'Final Exams',
    deadline: '2026-09-28',
    notes: '',
    completed: false,
  },
  {
    id: '5',
    title: 'Mco in CS302',
    subject: 'CS 302',
    deadline: '2026-09-28',
    notes: '',
    completed: false,
  },
];

export default sampleTasks;