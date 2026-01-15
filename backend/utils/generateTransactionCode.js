/**
 * Generate a random transaction code
 * Format: 3 uppercase letters + 3 numbers
 * Example: QJH234, ABC123, XYZ789
 */
function generateTransactionCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  // Generate 3 random uppercase letters
  let letterPart = '';
  for (let i = 0; i < 3; i++) {
    letterPart += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Generate 3 random numbers
  let numberPart = '';
  for (let i = 0; i < 3; i++) {
    numberPart += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return letterPart + numberPart;
}

module.exports = generateTransactionCode;



