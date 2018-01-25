import { authenticate } from './auth'
import search, { Meaning, Result } from '@bjrnt/seonbi-core'
import { getWords, setWord } from './sheets'
import * as makeDebug from 'debug'
import * as readline from 'readline'

const debug = makeDebug('sheet:main')

function genMeanings(meanings: Meaning[]): string {
  let result = ''
  meanings.forEach((meaning: Meaning, index: number) => {
    if (index !== 0) {
      result += '\n\n'
    }
    result += meaning.kr
    result += '\n'
    result += meaning.en
  })
  return result
}

function genEnglish(meanings: Meaning[]): string {
  let result = ''
  meanings.forEach((meaning: Meaning, index: number) => {
    if (index != 0) {
      result += ',\n'
    }
    result += meaning.translation
  })
  return result
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function pickResult(result: Result[]): Promise<Result> {
  if (result.length === 1) {
    return Promise.resolve(result[0])
  }

  return new Promise<Result>(resolve => {
    console.log('Multiple meanings detected:')
    result.forEach((result, i) => {
      console.log(
        `${i + 1}. ${result.word}${result.hanja ? ` (${result.hanja})` : ''}: ${
          result.meanings[0].translation
        }`
      )
    })
    rl.question('Pick your intended word: ', number => {
      resolve(result[Number(number) - 1])
    })
  })
}

async function main() {
  const authClient = await authenticate()
  const words = await getWords(authClient, { onlyUnanswered: true })
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    debug('Looking up', word)
    console.log(`Processing word ${i + 1}/${words.length}`)
    const result = await search(word, { matchExactly: true })
    if (result && result.length > 0) {
      const def = await pickResult(result)
      // Column order: 'Hanja', 'Explanation', 'English', 'Related', 'Examples', 'Misc'
      const definition = [
        def.hanja || '',
        genMeanings(def.meanings),
        genEnglish(def.meanings),
        '',
        '',
        '',
      ]
      debug('Saving', word)
      setWord(authClient, i + 2, definition)
    } else {
      debug('No results for', word)
    }
  }
  debug('Done!')
}

main()
