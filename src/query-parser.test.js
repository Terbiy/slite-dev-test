'use strict'

const { separator } = require('../config.json').queriesSettings
const {
  defaultContentType,
  availableStyles
} = require('../config.json').notesSettings
const { parseDecimalInt } = require('./utils.js')
const {
  parseCommand,
  parseCreation,
  parseInsertion,
  parseRemovement,
  parseGetting,
  parseFormatting
} = require('./query-parser.js')

describe('Query Parser tests', () => {
  describe('Command parsing', () => {
    it('Should return empty line when no argument is passed', () => {
      expect(parseCommand()).toBe('')
    })

    it('Should return empty line when empty line is passed as argument', () => {
      expect(parseCommand('')).toBe('')
    })

    it('Should return whole string when no separator is present', () => {
      const STRING_TO_TEST = 'Hello!'

      expect(parseCommand(STRING_TO_TEST)).toBe(STRING_TO_TEST)
    })

    it('Should return the part of query before the first separator', () => {
      const COMMAND = 'get'

      expect(parseCommand(`${COMMAND}${separator}something`)).toBe(COMMAND)
    })
  })

  describe('Create command parsing', () => {
    const CREATE_COMMAND_NULL_OBJECT = {
      id: ''
    }

    it('Should return null object of create command when no argument is passed', () => {
      expect(parseCreation()).toEqual(CREATE_COMMAND_NULL_OBJECT)
    })

    it('Should return null object when query comes without id property', () => {
      expect(parseCreation(`create${separator}`)).toEqual(
        CREATE_COMMAND_NULL_OBJECT
      )
    })

    it('Should return an object with id property filled when valid query is present', () => {
      const ID = 'some id'

      expect(parseCreation(`create${separator}${ID}`)).toEqual({
        id: ID
      })
    })
  })

  describe('Insert command parsing', () => {
    const INSERT_COMMAND_NULL_OBJECT = {
      id: '',
      position: Number.MAX_SAFE_INTEGER,
      text: ''
    }

    it('Should return null object of insert command when no argument is passed', () => {
      expect(parseInsertion()).toEqual(INSERT_COMMAND_NULL_OBJECT)
    })

    it('Should return object with default values for position and text when only id is present', () => {
      const ID = 'test'

      expect(parseInsertion(`insert${separator}${ID}`)).toEqual({
        ...INSERT_COMMAND_NULL_OBJECT,
        id: ID
      })
    })

    it('Should return object with third substring used as text property when fourth is missing', () => {
      const ID = 'test'
      const TEXT = 'hi'
      const query = buildQuery('insert', ID, TEXT)

      expect(parseInsertion(query)).toEqual({
        id: ID,
        position: Number.MAX_SAFE_INTEGER,
        text: TEXT
      })
    })

    it('Should return object with position set to default when wrong value is supplied', () => {
      const ID = 'here'
      const POSITION_TEXT = 'OH NO'
      const TEXT = 'world'
      const query = buildQuery('insert', ID, POSITION_TEXT, TEXT)

      expect(parseInsertion(query)).toEqual({
        id: ID,
        position: Number.MAX_SAFE_INTEGER,
        text: TEXT
      })
    })

    it('Should return object with all properties set correctly when valid query is passed', () => {
      const ID = 'test'
      const POSITION_TEXT = '123'
      const TEXT = 'some text here'
      const query = buildQuery('insert', ID, POSITION_TEXT, TEXT)

      expect(parseInsertion(query)).toEqual({
        id: ID,
        position: parseInt(POSITION_TEXT, 10),
        text: TEXT
      })
    })
  })

  describe('Delete command parsing', () => {
    it('Should parse as create command', () => {
      const ID = 'bad'

      ;[undefined, '', 'hi!', buildQuery('delete', ID)].forEach(query => {
        expect(parseRemovement(query)).toEqual(parseCreation(query))
      })
    })
  })

  describe('Get command parsing', () => {
    const GET_COMMAND_NULL_OBJECT = {
      id: '',
      contentType: defaultContentType
    }

    it('Should return null object of get command when no argument is passed', () => {
      expect(parseGetting()).toEqual(GET_COMMAND_NULL_OBJECT)
    })

    it(`Should return object with content type set to ${defaultContentType} when it is missed in query`, () => {
      const ID = 'good'
      const query = buildQuery('get', ID)

      expect(parseGetting(query)).toEqual({
        ...GET_COMMAND_NULL_OBJECT,
        id: ID
      })
    })

    it('Should return object with all properties set correctly when query is valid', () => {
      const ID = 'qwerty'
      const CONTENT_TYPE = 'md'
      const query = buildQuery('get', ID, CONTENT_TYPE)

      expect(parseGetting(query)).toEqual({
        id: ID,
        contentType: CONTENT_TYPE
      })
    })
  })

  describe('Format command parsing', () => {
    const FORMAT_COMMAND_NULL_OBJECT = {
      id: '',
      start: 0,
      end: 0,
      style: ''
    }

    it('Should return null object of get command when no argument is passed', () => {
      expect(parseFormatting()).toEqual(FORMAT_COMMAND_NULL_OBJECT)
    })

    it('Should return object without style when any of the start or end arguments are missing', () => {
      const ID = 'hey, test!'
      const EITHER_START_OR_END = '12'
      const style = availableStyles.italic
      const query = buildQuery('format', ID, EITHER_START_OR_END, style)

      expect(parseFormatting(query)).toEqual({
        ...FORMAT_COMMAND_NULL_OBJECT,
        id: ID,
        start: parseDecimalInt(EITHER_START_OR_END)
      })
    })

    it('Should return object without style when both start and end arguments are missing', () => {
      const ID = 'ID'
      const style = availableStyles.bold
      const query = buildQuery('format', ID, style)

      expect(parseFormatting(query)).toEqual({
        ...FORMAT_COMMAND_NULL_OBJECT,
        id: ID
      })
    })

    it('Should return proper object for all arguments present', () => {
      const ID = 'UUID'
      const START = '10'
      const END = '32'
      const style = availableStyles.italic
      const query = buildQuery('format', ID, START, END, style)

      expect(parseFormatting(query)).toEqual({
        id: ID,
        start: parseDecimalInt(START),
        end: parseDecimalInt(END),
        style
      })
    })
  })
})

function buildQuery(...parts) {
  return parts.join(separator)
}
