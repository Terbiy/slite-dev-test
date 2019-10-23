'use strict'

const { availableStyles } = require('../config.json').notesSettings
const { PartitionedTexts } = require('./partitioned-texts.js')

describe('Collection of partitioned texts', () => {
  describe('Texts insertions', () => {
    let partitionedTexts = null

    beforeEach(() => {
      partitionedTexts = new PartitionedTexts()
    })

    it('Should insert text in the beginning when partinioned texts are fresh', () => {
      const TEXT = 'Some valid text'

      expect(partitionedTexts.insert(TEXT)[0].text).toBe(TEXT)
    })

    it('Should insert text in the end when no position is provided', () => {
      const TEXTS = ['Hello', 'And hi']

      expect(partitionedTexts.insert(TEXTS[0]).insert(TEXTS[1])[1].text).toBe(
        TEXTS[1]
      )
    })

    it('Should insert text inside other when their positions intersect', () => {
      expect(
        partitionedTexts.insert('Hello World!').insert(' nice', 5)[0].text
      ).toBe('Hello nice World!')
    })

    it('Should insert text in multiple positions', () => {
      expect(
        partitionedTexts
          .insert('Hello')
          .insert('World', 5)
          .insert(' ', 5)
          .insert('!', 11)
          .prepareTxt()
      ).toBe('Hello World!')
    })

    it('Should treat the formatting right when inserting the text', () => {
      expect(
        partitionedTexts
          .insert(' World')
          .format(1, 6, availableStyles.bold)
          .insert('Hello', 0)
          .prepareMd()
      ).toBe('Hello **World**')
    })
  })

  describe('Formatting', () => {
    let partitionedTexts = null

    beforeEach(() => {
      partitionedTexts = new PartitionedTexts().insert(
        'Some text that is good to have here'
      )
    })

    it('Should format the required part in the simple case', () => {
      expect(
        partitionedTexts
          .format(0, 4, availableStyles.italic)[0]
          .toStyledString()
      ).toBe('*Some*')

      expect(partitionedTexts[1].toStyledString()).toBe(
        ' text that is good to have here'
      )
    })

    it('Should format the required part from the middle', () => {
      expect(
        partitionedTexts.format(5, 9, availableStyles.bold)[1].toStyledString()
      ).toBe('**text**')
    })

    it('Should support consecutive formatting', () => {
      expect(
        partitionedTexts
          .format(0, 10, availableStyles.italic)
          .format(15, 100, availableStyles.bold)[1]
          .toStyledString()
      ).toBe('that ')
    })

    it('Should support overlapping formatting', () => {
      expect(
        partitionedTexts
          .format(0, 22, availableStyles.italic)
          .format(10, 30, availableStyles.bold)[1]
          .toStyledString()
      ).toBe('***that is good***')
    })
  })
})
