'use strict'

const { Segment } = require('./segment.js')

class SegmentsList {
  constructor() {
    this.list = null
  }

  addSegment(start, end) {
    const segment = new Segment(start, end)

    if (!this.list) {
      this.list = segment
    } else {
      this.insertSegment(segment)
    }

    return this
  }

  reduce(callback, initialValue) {
    let intermediateValue = initialValue
    let segment = this.list
    let counter = 0

    while (segment) {
      intermediateValue = callback(intermediateValue, segment, counter)

      segment = segment.next
      counter++
    }

    return intermediateValue
  }

  insertSegment(segment) {
    let previousSegment = null
    let currentSegment = this.list
    let segmentToInsert = segment

    do {
      if (currentSegment.followsAfterDistantly(segmentToInsert)) {
        segmentToInsert.setNext(currentSegment)

        if (previousSegment === null) {
          this.list = segmentToInsert
        } else {
          previousSegment.setNext(segmentToInsert)
        }

        return
      }

      if (currentSegment.followsAfterImmediatly(segmentToInsert)) {
        currentSegment.merge(segmentToInsert)

        return
      }

      if (
        currentSegment.intersects(segmentToInsert) ||
        currentSegment.staysImmediatlyBefore(segmentToInsert)
      ) {
        currentSegment.merge(segmentToInsert)

        if (segmentToInsert.next) {
          currentSegment.setNext(segmentToInsert.next)
        }

        if (!currentSegment.next || segmentToInsert === currentSegment.next) {
          currentSegment.setNext(null)

          return
        }

        segmentToInsert = currentSegment.next

        continue
      }

      if (currentSegment.next) {
        previousSegment = currentSegment
        currentSegment = currentSegment.next

        continue
      }

      if (!currentSegment.next) {
        currentSegment.setNext(segmentToInsert)

        return
      }
    } while (true)
  }
}

module.exports = {
  SegmentsList
}
