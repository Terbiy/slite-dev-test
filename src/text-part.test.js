'use strict'

const { TextPart } = require('./text-part.js')

describe('Text part', () => {
  it('Should create text part with text', () => {
    const TEXT = 'SOME TEXT'

    expect(new TextPart(TEXT).text).toBe(TEXT)
  })

  it('Should behave as text when used in these conditions', () => {
    const TEXT = 'another'

    expect(new TextPart(TEXT) + new TextPart(TEXT)).toBe(TEXT + TEXT)
  })

  describe('Insertion of the text', () => {
    it('Should paste text at the end when no position is provided', () => {
      const TEXT = 'Hello'
      const OTHER_TEXT = ' World!'

      expect(new TextPart(TEXT).insert(OTHER_TEXT).text).toBe(TEXT + OTHER_TEXT)
    })

    it('Should paste text at the desired position', () => {
      expect(new TextPart('Hello World!').insert(' good', 5).text).toBe(
        'Hello good World!'
      )
    })
  })

  describe('Splitting', () => {
    const TEXTS = ['This text ', 'part', ' is especially good at splitting']
    const textPart = new TextPart(TEXTS[0] + TEXTS[1] + TEXTS[2])

    it('Should split text part into array of three when valid start and end are present', () => {
      expect(
        textPart.getSplit({
          start: 10,
          end: 14
        })
      ).toEqual({
        start: new TextPart(TEXTS[0]),
        desired: new TextPart(TEXTS[1]),
        end: new TextPart(TEXTS[2])
      })
    })

    it('Should split text part into array of to when either start or end is present', () => {
      expect(
        textPart.getSplit({
          start: 10
        })
      ).toEqual({
        start: new TextPart(TEXTS[0]),
        desired: new TextPart(TEXTS[1] + TEXTS[2])
      })

      expect(
        textPart.getSplit({
          end: 14
        })
      ).toEqual({
        desired: new TextPart(TEXTS[0] + TEXTS[1]),
        end: new TextPart(TEXTS[2])
      })
    })
  })
})
