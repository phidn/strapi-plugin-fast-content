const { ApplicationError, ValidationError } = require('@strapi/utils').errors

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin('fast-content')
      .service('myService')
      .getWelcomeMessage();
  },

  async importEntries(ctx) {
    try {
      const { uid, entries } = ctx.request.body

      const result = await strapi.db
        .query(uid)
        .createMany({
          data: entries,
        })

      return {
        data: {
          error: entries.length - result.count,
          success: result.count
        },
        ok: true
      }
    } catch (error) {
      console.log('→ controller.plugin.fast-content.importEntries error', error)
      throw new ApplicationError(error.message)
    }
  },

  async getUids(ctx) {
    try {
      const contentTypes = strapi.contentTypes
      const uids = Object.keys(contentTypes).filter(x => (
        x.startsWith('api::') &&
        contentTypes[x].kind === 'collectionType'
      ))

      return {
        data: uids,
        contentTypes,
        ok: true
      }
    } catch (error) {
      console.log('→ controller.plugin.fast-content.getUids error', error)
      throw new ApplicationError(error.message)
    }
  },

  async getContentTypes(ctx) {
    try {
      const contentTypes = Object
        .keys(strapi.contentTypes)
        .filter(x => (
          x.startsWith('api::') &&
          strapi.contentTypes[x].kind === 'collectionType'
        ))
        .map(x => strapi.contentTypes[x])


      return {
        data: contentTypes,
        ok: true
      }
    } catch (error) {
      console.log('→ controller.plugin.fast-content.getContentTypes error', error)
      throw new ApplicationError(error.message)
    }
  }
};
