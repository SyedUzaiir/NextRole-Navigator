/**
 * Categorizes an employee based on their IDP score into one of the 9-Box Matrix categories.
 * 
 * Mapping:
 * 90 - 100: Stars
 * 80 - 89: High Performance
 * 70 - 79: Workhorses
 * 50 - 69: High Potential (covers 50-60 range and fills gap to 70)
 * 40 - 49: Core Players
 * 30 - 39: Effective
 * 20 - 29: Busy Mass
 * 10 - 19: Dilemmas
 * 0 - 9: Under Performance
 * 
 * @param {number} score - The IDP score of the employee.
 * @returns {string} - The category name.
 */
export const getNineBoxCategory = (score) => {
    if (score >= 90) return 'Stars';
    if (score >= 80) return 'High Performers';
    if (score >= 70) return 'Workhorses';
    if (score >= 60) return 'High Potential';
    if (score >= 50) return 'Core Players';
    if (score >= 40) return 'Effective';
    if (score >= 30) return 'Dilemmas';
    if (score >= 20) return 'Risk';
    return 'Underperformers';
};
