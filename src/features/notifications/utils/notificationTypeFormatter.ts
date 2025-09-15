// Utility to format notification types for display
// Uses dynamic transformation instead of hardcoded mapping
export const formatNotificationType = (type: string): string => {
  // Transform the backend enum value to user-friendly display format
  return type
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize each word
};

// Utility to format relative time (e.g., "about 2 hours ago")
export const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `about ${years} year${years > 1 ? "s" : ""} ago`;
  } else if (months > 0) {
    return `about ${months} month${months > 1 ? "s" : ""} ago`;
  } else if (days > 0) {
    return `about ${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `about ${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `about ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return "just now";
  }
};

// Extract offer ID from notification data for "Read More" functionality
export const extractOfferIdFromNotification = (data: any): string | null => {
  try {
    if (typeof data === "string") {
      const parsed = JSON.parse(data);
      return parsed?.offerId || null;
    } else if (data && typeof data === "object") {
      return data.offerId || null;
    }
  } catch (error) {}
  return null;
};
