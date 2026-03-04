// Utility functions for testing AI code review system

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
function validateEmail(email) {
  // SECURITY: Enhanced email validation with null checks
  if (!email || typeof email !== 'string') {
    return false;
  }

  // More comprehensive email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Formats user data for display
 * @param {Object} user - User object
 * @returns {string} - Formatted string
 */
function formatUserData(user) {
  // FIXED: Added comprehensive null/undefined checks
  if (!user || typeof user !== 'object') {
    return 'Invalid user data';
  }

  const name = user.name || 'Unknown User';
  const email = user.email || 'No Email';

  // Sanitize output to prevent injection
  const safeName = String(name).replace(/[<>]/g, '');
  const safeEmail = String(email).replace(/[<>]/g, '');

  return `${safeName} <${safeEmail}>`;
}

/**
 * Calculates user score based on activity
 * @param {Array} activities - User activities
 * @returns {number} - Calculated score
 */
function calculateUserScore(activities) {
  // FIXED: Added input validation and optimized scoring
  if (!Array.isArray(activities)) {
    console.warn('calculateUserScore: activities must be an array');
    return 0;
  }

  // PERFORMANCE: Use reduce for better functional approach
  const scoreMap = {
    'login': 1,
    'post': 5,
    'comment': 2,
    'share': 3,
    'like': 1
  };

  return activities.reduce((score, activity) => {
    if (!activity || typeof activity !== 'object' || !activity.type) {
      return score;
    }

    const activityScore = scoreMap[activity.type];
    if (activityScore !== undefined) {
      return score + activityScore;
    } else {
      console.warn(`Unknown activity type: ${activity.type}`);
      return score;
    }
  }, 0);
}

// FIXED: Memory leak resolved with proper cleanup
function debounce(func, delay) {
  if (typeof func !== 'function') {
    throw new Error('debounce: first argument must be a function');
  }

  if (typeof delay !== 'number' || delay < 0) {
    throw new Error('debounce: delay must be a non-negative number');
  }

  let timeoutId = null;

  const debouncedFunction = function (...args) {
    // Clear existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      timeoutId = null; // Reset to null after execution
      func.apply(this, args);
    }, delay);
  };

  // Add cleanup method to prevent memory leaks
  debouncedFunction.cancel = function() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFunction;
}

module.exports = {
  validateEmail,
  formatUserData,
  calculateUserScore,
  debounce
};
