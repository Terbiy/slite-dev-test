'use strict'

const { availableContentTypes } = require('../config.json').notesSettings
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
          id: ID,
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
    const noteResponse = {
      responseCode: httpCodes.ok,
      note: {
        id: ID,
        text: ''
      }
    }

    beforeAll(() => {
      return notesStorage.create({
        id: ID
      })
    })

    it('Should return existing note requested by id', () => {
      return expect(
        notesStorage.get({
          id: ID,
          contentType: availableContentTypes.txt
        })
      ).resolves.toEqual(noteResponse)
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

    afterAll(() => {
      return notesStorage.clear()
    })
  })
})
