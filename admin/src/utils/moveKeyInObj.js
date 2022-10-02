const moveItem = (data, from, to) => {
  var f = data.splice(from, 1)[0]
  data.splice(to, 0, f)
  return data
}
const preferredOrder = (obj, order) => {
  var newObject = {}
  for (var i = 0; i < order.length; i++) {
    if (obj.hasOwnProperty(order[i])) {
      newObject[order[i]] = obj[order[i]]
    }
  }
  return newObject
}

const moveKeyInObj = (obj, from, to) => {
  const orderKeys = moveItem(Object.keys(obj), from, to)
  return preferredOrder(obj, orderKeys)
}

module.exports = moveKeyInObj
