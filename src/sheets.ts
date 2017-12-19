import { flatten } from 'lodash'
const google = require('googleapis')
const sheets = google.sheets('v4')

type AuthClient = any

const spreadsheetId = '1Foa5KcIH5YX1N84iP_xTN7nRAmcxB45WrdYB28bR1A0'

export function getColumns(auth: AuthClient): Promise<string[]> {
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get(
      {
        auth,
        spreadsheetId,
        range: 'A1:Z99',
      },
      (err: any, response: any) => {
        if (err) {
          reject(err)
        }
        resolve(response.values[0])
      }
    )
  })
}

export function getWords(auth: AuthClient): Promise<string[]> {
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get(
      {
        auth,
        spreadsheetId,
        range: 'A2:A300',
      },
      (err: any, response: any) => {
        if (err) {
          return reject(err)
        }
        resolve(flatten(response.values))
      }
    )
  })
}

export function setWord(auth: AuthClient, row: number, definition: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.update(
      {
        auth,
        spreadsheetId,
        range: `B${row}:G${row + definition.length}`,
        resource: {
          majorDimension: 'ROWS',
          values: [definition],
        },
        valueInputOption: 'RAW',
      },
      (err: any, response: any) => {
        if (err) {
          return reject(err)
        }
        resolve(response)
      }
    )
  })
}
