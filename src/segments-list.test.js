'use strict'

const { SegmentsList } = require('./segments-list.js')
const { Segment } = require('./segment.js')

describe('List for keeping segments', () => {
  describe('List creation', () => {
    it('Should return empty list when creating the new one', () => {
      expect(new SegmentsList()).toEqual({
        list: null
      })
    })
  })

  describe('Segments adding', () => {
    let segmentsList = null

    beforeEach(() => {
      segmentsList = new SegmentsList()
    })

    it('Should add a single segment to the list', () => {
      segmentsList.addSegment(1, 5)

      expect(segmentsList.list).toEqual(new Segment(1, 5))
    })

    it('Should add two segments to the list', () => {
      segmentsList.addSegment(1, 5).addSegment(8, 10)

      expect(segmentsList.list).toEqual(
        new Segment(1, 5).setNext(new Segment(8, 10))
      )
    })

    it('Should add segment to the beginning if it has less values', () => {
      segmentsList
        .addSegment(10, 15)
        .addSegment(13, 14)
        .addSegment(18, 20)
        .addSegment(1, 2)

      expect(segmentsList.list).toEqual(
        new Segment(1, 2).setNext(
          new Segment(10, 15).setNext(new Segment(18, 20))
        )
      )
    })

    it('Should merge segment touching the first one', () => {
      segmentsList
        .addSegment(4, 6)
        .addSegment(10, 12)
        .addSegment(1, 4)

      expect(segmentsList.list).toEqual(
        new Segment(1, 6).setNext(new Segment(10, 12))
      )
    })

    it('Should merge two intersecting segments', () => {
      segmentsList.addSegment(1, 5).addSegment(4, 6)

      expect(segmentsList.list).toEqual(new Segment(1, 6))
    })

    it('Should merge segments which touch', () => {
      segmentsList
        .addSegment(10, 20)
        .addSegment(27, 30)
        .addSegment(50, 444)
        .addSegment(20, 27)

      expect(segmentsList.list).toEqual(
        new Segment(10, 30).setNext(new Segment(50, 444))
      )
    })

    it('Should merge three intersecting segments and set the last value to max', () => {
      segmentsList
        .addSegment(1, 3)
        .addSegment(4, 6)
        .addSegment(2, 10)

      expect(segmentsList.list).toEqual(new Segment(1, 10))
    })
  })
})
