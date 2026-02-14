export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const isPositiveNumber = (value: number): boolean => {
  return value > 0;
};

export const isValidISODate = (date: string): boolean => {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoDateRegex.test(date) && !isNaN(Date.parse(date));
};

export const formatAmount = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};
