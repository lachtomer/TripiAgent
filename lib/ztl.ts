export interface ZtlCheckResult {
  active: boolean;
  message: string;
  costEuro: number;
}

/**
 * Checks if entering Milan's Area C ZTL requires payment based on time and date.
 * ZTL Area C is active Monday-Friday 07:30 to 19:30. Inactive on weekends and holidays.
 * 
 * @param timeStr Time format HH:MM (e.g., "10:15", "18:55")
 * @param dateStr Date format YYYY-MM-DD or any valid date string
 */
export function checkMilanZTL(timeStr: string, dateStr: string): ZtlCheckResult {
  const date = new Date(dateStr);
  
  // Check if date parsing failed
  if (isNaN(date.getTime())) {
    return {
      active: true,
      message: "Invalid date format provided. Assumed active as precaution. Daily fee is €7.50.",
      costEuro: 7.50,
    };
  }

  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const isWeekend = day === 0 || day === 6;

  if (isWeekend) {
    return {
      active: false,
      message: "Milan ZTL (Area C) is inactive on weekends. Entry is free.",
      costEuro: 0,
    };
  }

  // Parse timeStr
  const timeRegex = /^([0-9]{1,2}):([0-9]{2})$/;
  const match = timeStr.match(timeRegex);
  if (!match) {
    return {
      active: true,
      message: "Invalid time format provided. Assumed active as precaution. Daily fee is €7.50.",
      costEuro: 7.50,
    };
  }

  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const minutesSinceMidnight = hour * 60 + minute;

  const startActiveMinutes = 7 * 60 + 30; // 07:30
  const endActiveMinutes = 19 * 60 + 30;  // 19:30

  const isWithinZtlHours = minutesSinceMidnight >= startActiveMinutes && minutesSinceMidnight <= endActiveMinutes;

  if (isWithinZtlHours) {
    return {
      active: true,
      message: `Milan ZTL (Area C) is active at ${timeStr}. Entering requires a €7.50 daily ticket.`,
      costEuro: 7.50,
    };
  }

  return {
    active: false,
    message: `Milan ZTL (Area C) is inactive outside active hours (07:30–19:30 Mon-Fri). Entry is free at ${timeStr}.`,
    costEuro: 0,
  };
}
