'use strict'

module.exports = {
  parseDecimalInt,
  getNumberInInterval
}

function parseDecimalInt(string) {
  return parseInt(string, 10)
}

function getNumberInInterval(number, min, max) {
  return Math.max(Math.min(number, max), min)
}
