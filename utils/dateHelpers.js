// utils/dateHelpers.js
//
// Small, pure helper functions related to dates. Keeping these separate from
// the screens/components is good practice: it means HomeScreen.js and
// TaskCard.js don't need to repeat date logic, and if a grader/teacher asks
// "how does sorting by deadline work?", you can point straight at this file.
//
// "Pure function" = given the same input, it always returns the same output,
// and it doesn't change anything outside itself (no side effects). That
// makes these functions easy to explain and easy to test individually.

// sortTasksByDeadline
// ---------------------------------------------------------------
// Takes an array of task objects and returns a NEW array (we never mutate
// the original array directly — that's a React best practice, since React
// decides whether to re-render based on whether the array reference changed)
// sorted from the soonest deadline to the furthest deadline.
//
// .slice() copies the array first, then .sort() sorts the copy in place.
// The sort comparator subtracts one date (in milliseconds) from another:
// if the result is negative, task 'a' comes first; if positive, 'b' comes first.
export function sortTasksByDeadline(tasks) {
  return tasks.slice().sort((a, b) => {
    return new Date(a.deadline) - new Date(b.deadline);
  });
}

// formatDeadline
// ---------------------------------------------------------------
// Converts a raw "YYYY-MM-DD" string into a friendlier display string,
// e.g. "2026-09-25" -> "Sep 25, 2026". This keeps the raw data (used for
// sorting/storage) separate from the presentation (used for the UI).
export function formatDeadline(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// getDaysRemaining
// ---------------------------------------------------------------
// Calculates how many whole days are left until the deadline, relative to
// right now. Used to show labels like "Due in 3 days" or "Overdue".
//
// Math.ceil rounds UP to the nearest whole day so that "2.1 days left"
// is reported as "3 days left" rather than truncating to 2.
export function getDaysRemaining(dateString) {
  const today = new Date();
  const deadline = new Date(dateString);

  // Zero-out the time portion of "today" so partial-day differences
  // (e.g. it's currently 11:58 PM) don't cause off-by-one results.
  today.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffInMs = deadline - today;
  return Math.ceil(diffInMs / msPerDay);
}

// getDeadlineLabel
// ---------------------------------------------------------------
// Turns the numeric days-remaining value into a short human-readable label,
// and also returns a "status" so the UI can color-code it (e.g. red for
// overdue). Returning an object {label, status} instead of two separate
// functions keeps related data bundled together.
export function getDeadlineLabel(dateString) {
  const days = getDaysRemaining(dateString);

  if (days < 0) {
    return { label: `Overdue by ${Math.abs(days)}d`, status: 'overdue' };
  }
  if (days === 0) {
    return { label: 'Due today', status: 'today' };
  }
  if (days === 1) {
    return { label: 'Due tomorrow', status: 'soon' };
  }
  return { label: `Due in ${days}d`, status: 'upcoming' };
}

// toDateInputString
// ---------------------------------------------------------------
// Converts a JS Date object (what the native date picker gives us) into the
// "YYYY-MM-DD" string our app stores and sorts by. We build the string
// manually with padStart instead of calling toISOString(), because
// toISOString() converts to UTC first — that can silently shift the date
// backward or forward by a day depending on the user's timezone. Reading
// getFullYear/getMonth/getDate keeps the date exactly as the user picked it,
// in their local time.
export function toDateInputString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}