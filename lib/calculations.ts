/**
 * Calculate total hours saved based on input frequency
 */
export function calculateTotalHoursSaved(
  hoursSavedDaily?: number,
  hoursSavedWeekly?: number,
  hoursSavedMonthly?: number,
  goLiveDate?: Date,
  timeRange: 'day' | 'week' | 'month' | 'all' = 'all'
): number {
  if (!goLiveDate) return 0;

  const now = new Date();
  const daysActive = Math.max(0, Math.floor((now.getTime() - new Date(goLiveDate).getTime()) / (1000 * 60 * 60 * 24)));

  let hoursPerDay = 0;
  if (hoursSavedDaily) {
    hoursPerDay = hoursSavedDaily;
  } else if (hoursSavedWeekly) {
    hoursPerDay = hoursSavedWeekly / 7;
  } else if (hoursSavedMonthly) {
    hoursPerDay = hoursSavedMonthly / 30;
  }

  let totalHours = 0;
  switch (timeRange) {
    case 'day':
      totalHours = hoursPerDay;
      break;
    case 'week':
      totalHours = hoursPerDay * Math.min(7, daysActive);
      break;
    case 'month':
      totalHours = hoursPerDay * Math.min(30, daysActive);
      break;
    case 'all':
      totalHours = hoursPerDay * daysActive;
      break;
  }

  return Math.round(totalHours * 100) / 100;
}

/**
 * Calculate total ROI
 */
export function calculateROI(
  hoursSaved: number,
  employeeWage: number
): number {
  return Math.round(hoursSaved * employeeWage * 100) / 100;
}

/**
 * Calculate total cost including maintenance
 */
export function calculateTotalCost(
  devCost: number = 0,
  implementationCost: number = 0,
  monthlyMaintenance: number = 0,
  goLiveDate?: Date
): number {
  const oneTimeCosts = devCost + implementationCost;

  if (!goLiveDate || monthlyMaintenance === 0) {
    return oneTimeCosts;
  }

  const now = new Date();
  const monthsActive = Math.max(0, Math.floor(
    (now.getTime() - new Date(goLiveDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
  ));

  const maintenanceCosts = monthlyMaintenance * monthsActive;

  return Math.round((oneTimeCosts + maintenanceCosts) * 100) / 100;
}

/**
 * Calculate ROI percentage (ROI / Total Cost)
 */
export function calculateROIPercentage(
  roi: number,
  totalCost: number
): number {
  if (totalCost === 0) return 0;
  return Math.round((roi / totalCost) * 100);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format hours
 */
export function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} mins`;
  }
  return `${Math.round(hours * 10) / 10} hrs`;
}

/**
 * Calculate trend percentage change
 */
export function calculateTrend(
  currentValue: number,
  previousValue: number
): { percentage: number; direction: 'up' | 'down' | 'neutral' } {
  if (previousValue === 0) {
    return { percentage: 0, direction: 'neutral' };
  }

  const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
  const direction = percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral';

  return {
    percentage: Math.abs(Math.round(percentageChange)),
    direction,
  };
}

/**
 * Format date consistently for both server and client rendering
 * Prevents hydration mismatches by using predictable formatting
 */
export function formatDate(date: Date | string, options?: {
  includeYear?: boolean
  format?: 'short' | 'long'
}): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Use explicit formatting to ensure consistency across server/client
  const month = dateObj.toLocaleString('en-US', { month: options?.format === 'long' ? 'long' : 'short', timeZone: 'UTC' });
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();

  if (options?.includeYear) {
    return `${month} ${day}, ${year}`;
  }

  return `${month} ${day}`;
}

/**
 * Format date with full details (Month Day, Year)
 */
export function formatDateLong(date: Date | string): string {
  return formatDate(date, { includeYear: true, format: 'short' });
}
