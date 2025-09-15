/**
 * Duration utility functions for normalizing duration strings to ISO 8601 format
 */

/**
 * Converts various duration string formats to ISO 8601 duration format (PT#H#M#S)
 * 
 * Supported input formats:
 * - "18:35" -> "PT18M35S"
 * - "1:23:45" -> "PT1H23M45S"
 * - "50:58" -> "PT50M58S"
 * - "1 hr 3 min" -> "PT1H3M"
 * - "52 min 56 sec" -> "PT52M56S"
 * - "2h 30m 15s" -> "PT2H30M15S"
 */
export function normalizeToISO8601Duration(duration: string): string {
  if (!duration || typeof duration !== 'string') {
    return 'PT0S';
  }

  const cleanDuration = duration.trim().toLowerCase();

  // Pattern 1: MM:SS or HH:MM:SS format
  const timeMatch = cleanDuration.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (timeMatch) {
    const [, first, second, third] = timeMatch;
    
    if (third) {
      // HH:MM:SS format
      const hours = parseInt(first, 10);
      const minutes = parseInt(second, 10);
      const seconds = parseInt(third, 10);
      
      let result = 'PT';
      if (hours > 0) result += `${hours}H`;
      if (minutes > 0) result += `${minutes}M`;
      if (seconds > 0) result += `${seconds}S`;
      return result || 'PT0S';
    } else {
      // MM:SS format
      const minutes = parseInt(first, 10);
      const seconds = parseInt(second, 10);
      
      let result = 'PT';
      if (minutes > 0) result += `${minutes}M`;
      if (seconds > 0) result += `${seconds}S`;
      return result || 'PT0S';
    }
  }

  // Pattern 2: Text-based formats (1 hr 3 min, 52 min 56 sec, etc.)
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  // Extract hours
  const hourMatch = cleanDuration.match(/(\d+)\s*(?:hr?|hour?s?)/);
  if (hourMatch) {
    hours = parseInt(hourMatch[1], 10);
  }

  // Extract minutes
  const minuteMatch = cleanDuration.match(/(\d+)\s*(?:min?|minute?s?)/);
  if (minuteMatch) {
    minutes = parseInt(minuteMatch[1], 10);
  }

  // Extract seconds
  const secondMatch = cleanDuration.match(/(\d+)\s*(?:sec?|second?s?)/);
  if (secondMatch) {
    seconds = parseInt(secondMatch[1], 10);
  }

  // Pattern 3: Compact formats (2h 30m 15s)
  if (hours === 0 && minutes === 0 && seconds === 0) {
    const compactHourMatch = cleanDuration.match(/(\d+)h/);
    const compactMinuteMatch = cleanDuration.match(/(\d+)m/);
    const compactSecondMatch = cleanDuration.match(/(\d+)s/);

    if (compactHourMatch) hours = parseInt(compactHourMatch[1], 10);
    if (compactMinuteMatch) minutes = parseInt(compactMinuteMatch[1], 10);
    if (compactSecondMatch) seconds = parseInt(compactSecondMatch[1], 10);
  }

  // Build ISO 8601 duration string
  let result = 'PT';
  if (hours > 0) result += `${hours}H`;
  if (minutes > 0) result += `${minutes}M`;
  if (seconds > 0) result += `${seconds}S`;

  return result === 'PT' ? 'PT0S' : result;
}

/**
 * Validates if a duration string is in ISO 8601 format
 */
export function isISO8601Duration(duration: string): boolean {
  const iso8601Pattern = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  return iso8601Pattern.test(duration) && duration !== 'PT';
}

/**
 * Converts ISO 8601 duration back to human-readable format
 */
export function formatISO8601Duration(isoDuration: string): string {
  const match = isoDuration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return isoDuration;

  const [, hours, minutes, seconds] = match;
  const parts: string[] = [];

  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds) parts.push(`${seconds}s`);

  return parts.join(' ') || '0s';
}
