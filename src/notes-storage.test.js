'use strict'

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
  })
})
