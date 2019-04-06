/**
 * Date to ISOString helper module.
 * @module helpers/date
 */
/**
 * Transform a given Date object to an ISOString.
 * @param {Date} date The Date object to be transformed.
 * @return {string} The transformed ISOString.
 */
module.exports.dateToString = date => new Date(date).toISOString();
