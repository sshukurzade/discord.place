const useRateLimiter = require('@/utils/useRateLimiter');
const { param, validationResult, matchedData } = require('express-validator');
const Template = require('@/schemas/Template');
const getUserHashes = require('@/utils/getUserHashes');

module.exports = {
  get: [
    useRateLimiter({ maxRequests: 20, perMinutes: 1 }),
    param('id')
      .isString().withMessage('ID must be a string.')
      .isLength({ min: 12, max: 12 }).withMessage('ID must be 12 characters.'),
    async (request, response) => {
      const errors = validationResult(request);
      if (!errors.isEmpty()) return response.sendError(errors.array()[0].msg, 400);

      const { id } = matchedData(request);
      
      const template = await Template.findOne({ id });
      if (!template) return response.sendError('Template not found.', 404);

      const hashes = await getUserHashes(template.user.id);

      return response.json({
        name: template.name,
        username: template.user.username,
        avatar_url: `https://cdn.discordapp.com/avatars/${template.user.id}/${hashes.avatar}.png?size=64`,
        uses: template.uses,
        description: template.description,
        categories: template.categories
      });
    }
  ]
};