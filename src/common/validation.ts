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
  // Supports formats: 
  // - 2026-03-07T19:39
  // - 2026-03-07T19:39:00
  // - 2026-03-07T19:39:00.000Z
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?Z?$/;
  return isoDateRegex.test(date) && !isNaN(Date.parse(date));
};

export const formatAmount = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

export const isValidBase64Image = (base64String: string): boolean => {
  // Check if it's a valid base64 data URI for images
  const base64ImageRegex = /^data:image\/(png|jpg|jpeg|gif|webp|bmp|svg\+xml);base64,/;
  
  if (!base64ImageRegex.test(base64String)) {
    return false;
  }

  try {
    // Extract the base64 part after the comma
    const base64Data = base64String.split(',')[1];
    
    // Check if it's valid base64
    const decoded = Buffer.from(base64Data, 'base64').toString('base64');
    return decoded === base64Data;
  } catch (error) {
    return false;
  }
};

export const getBase64ImageSize = (base64String: string): number => {
  // Extract the base64 part after the comma
  const base64Data = base64String.split(',')[1] || base64String;
  
  // Calculate size in bytes
  const padding = (base64Data.match(/=/g) || []).length;
  return (base64Data.length * 3) / 4 - padding;
};

export const isBase64ImageSizeValid = (base64String: string, maxSizeInMB = 5): boolean => {
  const sizeInBytes = getBase64ImageSize(base64String);
  const sizeInMB = sizeInBytes / (1024 * 1024);
  return sizeInMB <= maxSizeInMB;
};
