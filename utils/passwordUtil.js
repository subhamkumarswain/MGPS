const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const SALT_ROUNDS = 10;

/**
 * Generate a random salt
 */
function generateSalt() {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Hash a password with the given salt
 */
async function hashPassword(password, salt) {
  try {
    // Use bcrypt for hashing
    const hash = await bcrypt.hash(password + salt, SALT_ROUNDS);
    return hash;
  } catch (err) {
    throw new Error('Error hashing password: ' + err.message);
  }
}

/**
 * Verify a password against a hash
 */
async function verifyPassword(password, salt, expectedHash) {
  try {
    const isValid = await bcrypt.compare(password + salt, expectedHash);
    return isValid;
  } catch (err) {
    throw new Error('Error verifying password: ' + err.message);
  }
}

module.exports = {
  generateSalt,
  hashPassword,
  verifyPassword
};
