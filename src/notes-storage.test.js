'use strict'

const {
  availableContentTypes,
  availableStyles
} = require('../config.json').notesSettings
const notesStorage = require('./notes-storage.js')
const httpCodes = require('./http-codes.json')

describe('Notes Storage tests', () => {
  describe('Creating notes', () => {
    it('Should create empty note for id not being added before', () => {
      const ID = 'test'

      return expect(
        notesStorage.create({
          id: ID
        })
      ).resolves.toEqual({
        responseCode: httpCodes.ok,
        note: {
          text: ''
        }
      })
    })

    it('Should reject creating note when no id is provided', () => {
      return expect(notesStorage.create({})).rejects.toEqual({
        responseCode: httpCodes.notAcceptable
      })
    })

    afterAll(() => {
      return notesStorage.clear()
    })
  })

  describe('Inserting text into notes', () => {
    const TEXT = 'Hello, World!'
    const ID = 'insert123'
    const NOTE_DATA = {
      id: ID
    }

    beforeEach(() => {
      return notesStorage.create(NOTE_DATA)
    })

    afterEach(() => {
      return notesStorage.remove(NOTE_DATA)
    })

    it('Should set the text for the fresh note', () => {
      return notesStorage
        .insert({
          id: ID,
          position: 0,
          text: TEXT
        })
        .then(() => notesStorage.get(NOTE_DATA))
        .then(({ note }) => {
          expect(note.text).toBe(TEXT)
        })
    })

    it('Should add the text at the end when no position is provided', () => {
      const INSERTION_DATA = {
        id: ID,
        text: TEXT
      }

      return insertTwice(INSERTION_DATA)
    })

    it('Should add the text at the end when provided position is greater than text length', () => {
      const INSERTION_DATA = {
        id: ID,
        position: 10000,
        text: TEXT
      }

      return insertTwice(INSERTION_DATA)
    })

    function insertTwice(insertionData) {
      return notesStorage
        .insert(insertionData)
        .then(() => notesStorage.insert(insertionData))
        .then(() => notesStorage.get(NOTE_DATA))
        .then(({ note }) => {
          expect(note.text).toBe(TEXT + TEXT)
        })
    }

    it('Should add text in the middle thus shifting its end', () => {
      return notesStorage
        .insert({
          id: ID,
          text: 'some text'
        })
        .then(() =>
          notesStorage.insert({
            id: ID,
            position: 4,
            text: ' more'
          })
        )
        .then(() =>
          notesStorage.get({
            id: ID
          })
        )
        .then(({ note }) => {
          expect(note.text).toBe('some more text')
        })
    })

    it('Should reject insertion when no id is provided', () => {
      return expect(
        notesStorage.insert({
          position: 12,
          text: 'let us bring the party!'
        })
      ).rejects.toEqual({
        responseCode: httpCodes.notAcceptable
      })
    })

    it('Should reject insertion when no text is provided', () => {
      return expect(
        notesStorage.insert({
          id: ID,
          position: 11
        })
      ).rejects.toEqual({
        responseCode: httpCodes.notAcceptable
      })
    })

    it('Should reject insertion when wrong id is provided', () => {
      return expect(
        notesStorage.insert({
          id: 'no such id',
          position: 0,
          text: 'no party!'
        })
      ).rejects.toEqual({
        responseCode: httpCodes.notFound
      })
    })
  })

  describe('Deleting notes', () => {
    it('Should return no note after deleting', () => {
      const NOTE_DATA = { id: 'delete123' }

      return expect(
        notesStorage
          .create(NOTE_DATA)
          .then(() => notesStorage.remove(NOTE_DATA))
      ).resolves.toEqual({
        responseCode: httpCodes.ok
      })
    })

    it('Should reject deleting when no id is provided', () => {
      return expect(notesStorage.remove()).rejects.toEqual({
        responseCode: httpCodes.notAcceptable
      })
    })

    it('Should reject deleting when non-existing id is provided', () => {
      return expect(notesStorage.remove({ id: '123' })).rejects.toEqual({
        responseCode: httpCodes.notFound
      })
    })
  })

  describe('Getting notes', () => {
    const ID = 'test234'
    const TEXT = 'Here is some text prepared to make testing possible'
    const noteResponse = {
      responseCode: httpCodes.ok,
      note: {
        text: TEXT
      }
    }

    beforeEach(() => {
      return notesStorage
        .create({
          id: ID
        })
        .then(() =>
          notesStorage.insert({
            id: ID,
            text: TEXT
          })
        )
    })

    afterEach(() => {
      return notesStorage.clear()
    })

    it('Should return existing note requested by id', () => {
      return expect(
        notesStorage.get({
          id: ID,
          contentType: availableContentTypes.txt
        })
      ).resolves.toEqual(noteResponse)
    })

    it('Should return requested note formatted in italic', () => {
      return notesStorage
        .format({
          id: ID,
          start: 5,
          end: 500,
          style: availableStyles.italic
        })
        .then(() =>
          notesStorage.get({
            id: ID,
            contentType: availableContentTypes.md
          })
        )
        .then(({ note }) => {
          expect(note.text).toBe(
            'Here *is some text prepared to make testing possible*'
          )
        })
    })

    it('Should return requested note formatted in bold', () => {
      return notesStorage
        .format({
          id: ID,
          start: 5,
          end: 500,
          style: availableStyles.bold
        })
        .then(() =>
          notesStorage.get({
            id: ID,
            contentType: availableContentTypes.md
          })
        )
        .then(({ note }) => {
          expect(note.text).toBe(
            'Here **is some text prepared to make testing possible**'
          )
        })
    })

    it('Should stick to default content type when unavailable is provided', () => {
      return expect(notesStorage.get({ id: ID })).resolves.toEqual(noteResponse)
    })

    it('Should reject returning note when no id is provided', () => {
      return expect(
        notesStorage.get({ contentType: availableContentTypes.txt })
      ).rejects.toEqual({
        responseCode: httpCodes.notAcceptable
      })
    })

    it('Should reject returning note when non-existing id is provided', () => {
      return expect(
        notesStorage.get({ id: '123', contentType: availableContentTypes.txt })
      ).rejects.toEqual({
        responseCode: httpCodes.notFound
      })
    })
  })

  describe('Formatting notes', () => {
    const ID = 'some id'

    beforeEach(() => {
      notesStorage
        .create({
          id: ID
        })
        .then(() =>
          notesStorage.insert({
            id: ID,
            text: 'Here is some text I need to type to implement the test'
          })
        )
    })

    afterEach(() => {
      return notesStorage.clear()
    })

    it('Should return 200 code when existing note is formatting with proper arguments', () => {
      return expect(
        notesStorage.format({
          id: ID,
          start: 1,
          end: 11,
          style: availableStyles.bold
        })
      ).resolves.toEqual({
        responseCode: httpCodes.ok
      })
    })

    it('Should reject formatting node when no id is provided', () => {
      return expect(
        notesStorage.format({
          start: 4,
          end: 8,
          style: availableStyles.italic
        })
      ).rejects.toEqual({
        responseCode: httpCodes.notAcceptable
      })
    })

    it('Should reject formatting when the note with provided id is not found', () => {
      return expect(
        notesStorage.format({
          id: 'no such id is present',
          start: 5,
          end: 77,
          style: availableStyles.bold
        })
      ).rejects.toEqual({
        responseCode: httpCodes.notFound
      })
    })

    it('Should reject formatting when wrong style is provided', () => {
      return expect(
        notesStorage.format({
          id: ID,
          start: 2,
          end: 4,
          style: 'some wrong style'
        })
      ).rejects.toEqual({
        responseCode: httpCodes.notAcceptable
      })
    })

    it('Should reject formatting when start is greater than end or equal to it', () => {
      return expect(
        notesStorage.format({
          id: ID,
          start: 10,
          end: 4,
          style: availableStyles.bold
        })
      ).rejects.toEqual({
        responseCode: httpCodes.notAcceptable
      })
    })
  })
})
