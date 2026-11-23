/**
 * Local Date & Time Utility Functions
 * Ensures all dates and times are evaluated in the user's LOCAL browser timezone
 * (avoiding UTC offset bugs where toISOString() points to tomorrow/yesterday).
 */

/**
 * Returns formatted YYYY-MM-DD string in the user's LOCAL timezone.
 */
export const getLocalDateString = (d = new Date()) => {
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns formatted HH:MM time string in local timezone.
 */
export const getLocalTimeString = (d = new Date()) => {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Returns offset date string (e.g. +1 for tomorrow, -1 for yesterday) in local timezone.
 */
export const getOffsetDateString = (offsetDays = 0, baseDate = new Date()) => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + offsetDays);
  return getLocalDateString(d);
};

/**
 * Returns the single date a task is attributed to for the progress graph:
 * Uses the task's created_at date (current date) in the user's local timezone
 * so tasks are NEVER duplicated across both today and future due dates.
 */
export const getTaskDate = (todo) => {
  if (!todo) return getLocalDateString();
  if (todo.created_at) {
    const localDate = getLocalDateString(todo.created_at);
    if (localDate) return localDate;
  }
  return todo.due_date || getLocalDateString();
};

/**
 * Determines if a task's timeline has finished based on user's auto-archive mode.
 * Modes:
 * - 'midnight': Clears tasks from previous days when new day starts at 12:00 AM
 * - 'time_passed': Clears tasks whose due time has passed today (if completed) or past days
 * - 'manual': Never auto-clears
 */
export const isTaskTimelineFinished = (todo, mode = 'midnight', now = new Date()) => {
  if (mode === 'manual' || !todo) return false;

  const todayStr = getLocalDateString(now);
  const currentTimeStr = getLocalTimeString(now);

  // If task has no due date, it's a backlog item that stays
  if (!todo.due_date) return false;

  // 1. If due date is before today, timeline has finished for both midnight & time_passed
  if (todo.due_date < todayStr) {
    return true;
  }

  // 2. If mode is 'time_passed' and due date is today:
  if (mode === 'time_passed' && todo.due_date === todayStr) {
    // If completed and due_time has passed (or if completed for over 15 minutes)
    if (todo.completed) {
      if (todo.due_time && todo.due_time <= currentTimeStr) {
        return true;
      }
      // If completed without due_time or completed earlier
      return true;
    }
  }

  return false;
};
