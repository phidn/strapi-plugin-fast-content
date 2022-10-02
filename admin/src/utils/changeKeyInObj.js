const changeKeyInObj = (obj, oldKey, newKey) => {
  const newObj = {}
  for (const key in obj) {
    if (key !== oldKey) {
      newObj[key] = obj[key]
    } else {
      newObj[newKey] = obj[oldKey]
    }
  }
  return newObj
}

module.exports = changeKeyInObj
