import slugify from '@sindresorhus/slugify'

export const toFriendly = (string, character = '_') => {
  let result = slugify(string, character)
  result = result.replace(/([A-Z])/, (match) => `${character}${match.toLowerCase()}`)
  result = result.replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, character)
  
  return result
}
