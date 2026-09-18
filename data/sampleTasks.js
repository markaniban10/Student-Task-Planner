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

const sampleTasks = [
  {
    id: '1',
    title: 'Finish HCI Usability Report',
    subject: 'HCI',
    deadline: '2026-09-25',
    notes: 'Cover low-fidelity vs high-fidelity prototyping comparison.',
    completed: false,
  },
  {
    id: '2',
    title: 'Networking Lab: Subnetting Exercise',
    subject: 'Networking',
    deadline: '2026-09-20',
    notes: 'Practice IP addressing and subnet mask calculations.',
    completed: false,
  },
  {
    id: '3',
    title: 'OS Memory Management Problem Set',
    subject: 'Operating Systems',
    deadline: '2026-09-22',
    notes: 'Paging, segmentation, and page replacement algorithms.',
    completed: true,
  },
  {
    id: '4',
    title: 'React Native Prototype Submission',
    subject: 'Mobile Programming',
    deadline: '2026-09-30',
    notes: 'Student Task & Assignment Planner app — this project!',
    completed: false,
  },
  {
    id: '5',
    title: 'Read Chapter 11: Interaction Design',
    subject: 'HCI',
    deadline: '2026-09-18',
    notes: '',
    completed: false,
  },
];

export default sampleTasks;
