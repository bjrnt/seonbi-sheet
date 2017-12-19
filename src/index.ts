import { authenticate } from './auth'
import search, { Meaning } from '@bjrnt/seonbi-core'
import { getWords, setWord } from './sheets'
import * as makeDebug from 'debug'

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

async function main() {
  const authClient = await authenticate()
  const words = await getWords(authClient)
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    debug('Looking up', word)
    const result = await search(word)
    if (result && result.length > 0) {
      const def = result[0]
      // Column order: 'Hanja', 'Explanation', 'English', 'Related', 'Examples', 'Misc'
      const definition = [
        def.hanja || '',
        genMeanings(def.meanings),
        genEnglish(def.meanings),
        '',
        '',
        result.length > 1 ? `Matched ${result[0].word}. Second match was ${result[1].word}.` : '',
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
