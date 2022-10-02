module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'controller.index',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/import-entries',
    handler: 'controller.importEntries',
  },
  {
    method: 'GET',
    path: '/uids',
    handler: 'controller.getUids',
  },
  {
    method: 'GET',
    path: '/content-types',
    handler: 'controller.getContentTypes',
  },
];
