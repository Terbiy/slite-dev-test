'use strict'

const { Segment } = require('./segment.js')

describe('Segment', () => {
  it('Should create new segment with start and end', () => {
    expect(new Segment(1, 4)).toEqual({
      start: 1,
      end: 4,
      next: null
    })
  })

  it('Should set segment to next', () => {
    const segment = new Segment(1, 4)
    const anotherSegment = new Segment(10, 13)

    expect(segment.setNext(anotherSegment).next).toBe(anotherSegment)
  })

  describe('Following after the segment', () => {
    it('Should return true when one segment vividly follows after another', () => {
      expect(new Segment(10, 15).followsAfterDistantly(new Segment(1, 2))).toBe(
        true
      )
    })

    it('Should return false when one segment ends one step before another', () => {
      expect(new Segment(1, 2).followsAfterDistantly(new Segment(0, 1))).toBe(
        false
      )
    })
  })

  describe('Following after immediatly', () => {
    it('Should return true when segments touche', () => {
      expect(new Segment(1, 2).followsAfterImmediatly(new Segment(0, 1))).toBe(
        true
      )
    })

    it('Should return false when there is no touch', () => {
      expect(
        new Segment(10, 20).followsAfterImmediatly(new Segment(1, 2))
      ).toBe(false)
    })
  })

  describe('Intersections of the segments', () => {
    it('Should return true when segment intersects original from left', () => {
      expect(new Segment(6, 9).intersects(new Segment(1, 7))).toBe(true)
    })

    it('Should return true when segment intersects original from right', () => {
      expect(new Segment(6, 9).intersects(new Segment(8, 11))).toBe(true)
    })

    it('Should return true when segment contains original', () => {
      expect(new Segment(6, 9).intersects(new Segment(1, 11))).toBe(true)
    })

    it('Should return true when original segment contains new', () => {
      expect(new Segment(1, 15).intersects(new Segment(2, 11))).toBe(true)
    })
  })

  describe('Staying immediatly before', () => {
    it('Should return true when stays immediatly before other segment', () => {
      expect(
        new Segment(1, 11).staysImmediatlyBefore(new Segment(11, 22))
      ).toBe(true)
    })

    it("Should return false when doesn't stay immediatly before other segment", () => {
      expect(
        new Segment(1, 10).staysImmediatlyBefore(new Segment(11, 22))
      ).toBe(false)
    })
  })

  describe('Merging other segment', () => {
    it('Should merge with segment', () => {
      const mergedSegment = new Segment(1, 4).merge(new Segment(3, 8))

      expect(mergedSegment).toEqual(new Segment(1, 8))
    })

    it('Should merge even if there are no intersections', () => {
      const mergedSegment = new Segment(1, 2).merge(new Segment(4, 5))

      expect(mergedSegment).toEqual(new Segment(1, 5))
    })
  })
})
