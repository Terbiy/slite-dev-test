'use strict'

const { getNumberInInterval } = require('./utils.js')
const { TextPart } = require('./text-part.js')

class PartitionedTexts extends Array {
  insert(text, position = Number.MAX_SAFE_INTEGER) {
    let relativePosition = getNumberInInterval(
      position,
      0,
      Number.MAX_SAFE_INTEGER
    )

    const insertTextAfterAll = this.every((textPart, index) => {
      if (relativePosition === 0) {
        this.splice(index, 0, new TextPart(text))

        return false
      }

      if (relativePosition >= textPart.length) {
        relativePosition -= textPart.length

        return true
      }

      textPart.insert(text, position)

      return false
    })

    if (insertTextAfterAll) {
      this.push(new TextPart(text))
    }

    return this
  }

  format(start = 0, end = Number.MAX_SAFE_INTEGER, style) {
    let relativeStart = getNumberInInterval(start, 0, Number.MAX_SAFE_INTEGER)
    let relativeEnd = getNumberInInterval(end, 0, Number.MAX_SAFE_INTEGER)

    if (relativeStart > relativeEnd) {
      throw new Error({
        message: 'The end cannot be before the start.'
      })
    }

    let beginningIndex = -1
    let deleteCount = 0
    const newParts = []

    this.every((textPart, index) => {
      const { length } = textPart
      if (relativeStart >= length) {
        relativeStart -= length
        relativeEnd -= length

        return true
      }

      if (beginningIndex < 0) {
        beginningIndex = index
      }
      deleteCount++

      const endForPart = Math.min(length, relativeEnd)

      const { start, desired, end } = textPart.getSplit({
        start: relativeStart,
        end: endForPart
      })

      if (start) {
        newParts.push(start)
      }

      newParts.push(desired.format(style))

      if (end) {
        newParts.push(end)
      }

      if (relativeEnd < length) {
        return false
      }

      relativeStart = Math.max(0, relativeStart - length)
      relativeEnd -= length

      return true
    })

    this.splice(beginningIndex, deleteCount, ...newParts)

    return this
  }
}

module.exports = {
  PartitionedTexts
}
