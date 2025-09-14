const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VcarePOS API',
      version: '1.0.0',
      description: 'API documentation for VcarePOS backend',
    },
    servers: [
      { url: 'http://localhost:3000/api/' },
      { url: 'https://vcarepos-api.nimesha.dev/api/' }
    ],
  },
  apis: ['./src/routes/*.js'], // All route files
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
