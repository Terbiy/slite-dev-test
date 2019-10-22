'use strict'

class Segment {
  constructor(start, end) {
    this.start = start
    this.end = end
    this.next = null
  }

  setNext(next) {
    this.next = next

    return this
  }

  followsAfterDistantly(segment) {
    return segment.end < this.start
  }

  followsAfterImmediatly(segment) {
    return segment.end === this.start
  }

  intersects(
    segment = new Segment(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
  ) {
    return segment.start < this.end && this.start < segment.end
  }

  staysImmediatlyBefore(segment) {
    return this.end === segment.start
  }

  merge(segment) {
    this.start = Math.min(this.start, segment.start)
    this.end = Math.max(this.end, segment.end)

    return this
  }
}

module.exports = {
  Segment
}
