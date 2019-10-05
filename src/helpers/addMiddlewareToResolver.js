const addMiddlewareToResolver = (operation, [middleware]) => {
  let appliedObj = {};
  for (let key of Object.keys(operation)) {
    appliedObj = {
      ...appliedObj,
      [key]: middleware
    };
  }
  return appliedObj;
};

module.exports = addMiddlewareToResolver;
