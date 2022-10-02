const isDateTime = (_date) => {
  const _regExp = new RegExp(
    "^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$"
  );
  return _regExp.test(_date);
};

var isDate = function (date) {
  return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
};

const getValueType = (value) => {
  let _type = "";
  switch (typeof value) {
    case "object":
      _type = "json";
      break;
    case "number":
      _type = "integer";
      break;
    case "boolean":
      _type = "boolean";
      break;
    default:
      if (isDateTime(value)) {
        _type = "datetime";
      } else if (isDate(value)) {
        _type = "date";
      } else {
        _type = value.toString().length < 255 ? "string" : "text";
      }
      break;
  }
  return _type;
};

export default getValueType;
