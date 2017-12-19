import * as fs from 'fs'
import * as readline from 'readline'
import * as makeDebug from 'debug'

const debug = makeDebug('sheet:auth')

const googleAuth = require('google-auth-library')

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const TOKEN_DIR = './.credentials'
const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json'

export function authenticate() {
  return new Promise((resolve, reject) => {
    fs.readFile('./client_id.json', (err, content) => {
      if (err) {
        console.log('Error loading client secret file')
        return reject(err)
      }

      authorize(JSON.parse(content.toString()), resolve)
    })
  })
}

function authorize(credentials: any, callback: Function) {
  var clientSecret = credentials.installed.client_secret
  var clientId = credentials.installed.client_id
  var redirectUrl = credentials.installed.redirect_uris[0]
  var auth = new googleAuth()
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      getNewToken(oauth2Client, callback)
    } else {
      oauth2Client.credentials = JSON.parse(token.toString())
      callback(oauth2Client)
    }
  })
}

function getNewToken(oauth2Client: any, callback: Function) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })
  console.log('Authorize this app by visiting this url: ', authUrl)
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.question('Enter the code from that page here: ', code => {
    rl.close()
    oauth2Client.getToken(code, (err: any, token: any) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err)
        return
      }
      oauth2Client.credentials = token
      storeToken(token)
      callback(oauth2Client)
    })
  })
}

function storeToken(token: any) {
  try {
    fs.mkdirSync(TOKEN_DIR)
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), () => {})
  debug('Token stored to ' + TOKEN_PATH)
}
