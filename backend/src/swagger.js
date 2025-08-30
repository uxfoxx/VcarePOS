const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VcarePOS API',
      version: '1.0.0',
      description: 'API documentation for VcarePOS backend with e-commerce integration',
    },
    servers: [
      { url: 'http://localhost:3000/api/' },
      { url: 'https://vcarepos-api.nimesha.dev/api/' }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and user management'
      },
      {
        name: 'Ecommerce',
        description: 'Public e-commerce endpoints for online store integration'
      },
      {
        name: 'Customers',
        description: 'E-commerce customer management (POS staff only)'
      },
      {
        name: 'Products',
        description: 'Product inventory management'
      },
      {
        name: 'RawMaterials',
        description: 'Raw materials inventory management'
      },
      {
        name: 'Transactions',
        description: 'Sales transaction management'
      },
      {
        name: 'Coupons',
        description: 'Coupon and discount management'
      },
      {
        name: 'Taxes',
        description: 'Tax configuration and management'
      },
      {
        name: 'Categories',
        description: 'Product category management'
      },
      {
        name: 'PurchaseOrders',
        description: 'Purchase order and vendor management'
      },
      {
        name: 'Vendors',
        description: 'Vendor management'
      },
      {
        name: 'Users',
        description: 'System user management'
      },
      {
        name: 'Audit',
        description: 'System audit trail'
      },
      {
        name: 'System',
        description: 'System monitoring and diagnostics'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Customer: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'CUST-123456'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            email: {
              type: 'string',
              example: 'john.doe@email.com'
            },
            phone: {
              type: 'string',
              example: '+94771234567'
            },
            address: {
              type: 'string',
              example: '123 Main Street'
            },
            city: {
              type: 'string',
              example: 'Colombo'
            },
            postalCode: {
              type: 'string',
              example: '00100'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            emailVerified: {
              type: 'boolean',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        EcommerceProduct: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'PROD-123456'
            },
            name: {
              type: 'string',
              example: 'Executive Dining Table'
            },
            description: {
              type: 'string',
              example: 'Premium oak dining table with elegant design'
            },
            category: {
              type: 'string',
              example: 'Tables'
            },
            price: {
              type: 'number',
              example: 899.99
            },
            stock: {
              type: 'integer',
              example: 15
            },
            image: {
              type: 'string',
              example: 'https://example.com/image.jpg'
            },
            colors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  colorCode: { type: 'string' },
                  image: { type: 'string' },
                  sizes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        stock: { type: 'integer' },
                        dimensions: { type: 'object' },
                        weight: { type: 'number' }
                      }
                    }
                  }
                }
              }
            },
            addons: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' },
                  unit: { type: 'string' }
                }
              }
            }
          }
        },
        EcommerceOrder: {
          type: 'object',
          properties: {
            customer: {
              type: 'object',
              properties: {
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                email: { type: 'string', example: 'john.doe@email.com' },
                phone: { type: 'string', example: '+94771234567' },
                address: { type: 'string', example: '123 Main Street' },
                city: { type: 'string', example: 'Colombo' },
                postalCode: { type: 'string', example: '00100' }
              }
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string', example: 'PROD-123456' },
                  quantity: { type: 'integer', example: 2 },
                  selectedColorId: { type: 'string', example: 'COLOR-123' },
                  selectedSize: { type: 'string', example: 'Medium' },
                  addons: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        quantity: { type: 'number' },
                        price: { type: 'number' }
                      }
                    }
                  }
                }
              }
            },
            deliveryArea: {
              type: 'string',
              enum: ['inside_colombo', 'outside_colombo'],
              example: 'inside_colombo'
            },
            paymentMethod: {
              type: 'string',
              enum: ['cod', 'bank_transfer'],
              example: 'cod'
            },
            receiptUrl: {
              type: 'string',
              example: 'https://example.com/receipt.jpg'
            },
            appliedCoupon: {
              type: 'string',
              example: 'WELCOME10'
            },
            notes: {
              type: 'string',
              example: 'Please call before delivery'
            }
          }
        },
        DeliveryZone: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'ZONE-001'
            },
            name: {
              type: 'string',
              example: 'Inside Colombo'
            },
            description: {
              type: 'string',
              example: 'Delivery within Colombo city limits'
            },
            charge: {
              type: 'number',
              example: 300.00
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // All route files
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
