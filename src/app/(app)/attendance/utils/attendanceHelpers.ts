export const getAttendanceStatus = (percentage: number) => {
  if (percentage >= 90) return { color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30", message: "Excellent" };
  if (percentage >= 75) return { color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30", message: "Good" };
  if (percentage >= 60) return { color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-100 dark:bg-yellow-900/30", message: "Average" };
  return { color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", message: "At Risk" };
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}; 