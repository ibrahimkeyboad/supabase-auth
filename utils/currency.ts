/**
 * Currency utilities for Tanzania Shillings (TZS)
 */

export const CURRENCY_SYMBOL = 'TSh';
export const CURRENCY_CODE = 'TZS';

/**
 * Format amount in TZS with proper separators
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return `${CURRENCY_SYMBOL} 0`;
  
  return `${CURRENCY_SYMBOL} ${amount.toLocaleString('en-TZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Format amount for display without currency symbol
 */
export function formatAmount(amount: number): string {
  if (isNaN(amount)) return '0';
  
  return amount.toLocaleString('en-TZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string): number {
  const cleanString = currencyString
    .replace(CURRENCY_SYMBOL, '')
    .replace(/,/g, '')
    .trim();
  
  const amount = parseFloat(cleanString);
  return isNaN(amount) ? 0 : amount;
}

/**
 * Calculate percentage of amount
 */
export function calculatePercentage(amount: number, percentage: number): number {
  return Math.round(amount * (percentage / 100));
}

/**
 * Calculate tax amount (18% VAT in Tanzania)
 */
export function calculateTax(amount: number): number {
  const TAX_RATE = 0.18; // 18% VAT
  return Math.round(amount * TAX_RATE);
}

/**
 * Round to nearest TZS (no decimals)
 */
export function roundCurrency(amount: number): number {
  return Math.round(amount);
}

/**
 * Convert USD to TZS (mock exchange rate)
 */
export function convertUSDToTZS(usdAmount: number): number {
  const EXCHANGE_RATE = 2300; // Mock rate: 1 USD = 2300 TZS
  return Math.round(usdAmount * EXCHANGE_RATE);
}

/**
 * Validate currency amount
 */
export function isValidAmount(amount: number): boolean {
  return !isNaN(amount) && amount >= 0 && isFinite(amount);
}