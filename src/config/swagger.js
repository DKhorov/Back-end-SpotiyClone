import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Spotify Clone API',
      version: '1.0.0',
      description: 'API документация для Spotify Clone',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Локальный сервер разработки',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./index.js', './control/*.js'], // Пути к файлам с JSDoc комментариями
};

const specs = swaggerJsdoc(options);

export default specs;
