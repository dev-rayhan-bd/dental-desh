export const generateTrackingId = (): string => {
  const timestamp = Date.now().toString().slice(-6); //last 4 digit of time
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // 8 digit random num
  return `${timestamp}${randomDigits}`; // total 10 digit id
};