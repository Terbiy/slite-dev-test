'use strict'

const { availableContentTypes } = require('../config.json').queriesSettings
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

    it('Should reject creating note when the required id is occupied', () => {
      const NOTE_DATA = {
        id: 'test123'
      }

      return expect(
        notesStorage
          .create(NOTE_DATA)
          .then(() => notesStorage.create(NOTE_DATA))
      ).rejects.toEqual({
        responseCode: httpCodes.locked
      })
    })

    afterAll(() => {
      notesStorage.clear()
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
      notesStorage.clear()
    })
  })
})
