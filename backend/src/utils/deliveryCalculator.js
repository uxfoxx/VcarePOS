const { pool } = require('./db');

async function getActiveDeliverySettings(source = null) {
  let query = 'SELECT * FROM delivery_charge_settings WHERE is_active = true';
  const values = [];

  if (source === 'pos') {
    query += ' AND enabled_for_pos = true';
  } else if (source === 'ecommerce') {
    query += ' AND enabled_for_ecommerce = true';
  }

  const result = await pool.query(query, values);

  const settings = {};
  result.rows.forEach(row => {
    settings[row.type] = row;
  });

  return settings;
}

function calculateDeliveryCharge(weight, deliveryType, settings) {
  if (!weight || weight <= 0) {
    return {
      deliveryCharge: 0,
      breakdown: {
        totalWeight: weight,
        deliveryType,
        error: 'Invalid weight'
      }
    };
  }

  const setting = settings[deliveryType];

  if (!setting || !setting.is_active) {
    return {
      deliveryCharge: 0,
      breakdown: {
        totalWeight: weight,
        deliveryType,
        error: 'Delivery type not available'
      }
    };
  }

  switch (deliveryType) {
    case 'free_delivery':
      return {
        deliveryCharge: 0,
        breakdown: {
          totalWeight: weight,
          deliveryType: 'free_delivery',
          description: 'Free delivery'
        }
      };

    case 'inside_colombo':
      return {
        deliveryCharge: parseFloat(setting.inside_colombo_amount) || 0,
        breakdown: {
          totalWeight: weight,
          deliveryType: 'inside_colombo',
          flatRate: parseFloat(setting.inside_colombo_amount) || 0,
          description: `Inside Colombo - Flat rate`
        }
      };

    case 'out_of_colombo':
      const baseWeight = parseFloat(setting.out_of_colombo_base_weight) || 0;
      const baseAmount = parseFloat(setting.out_of_colombo_base_amount) || 0;
      const perKgAmount = parseFloat(setting.out_of_colombo_per_kg_amount) || 0;

      if (weight <= baseWeight) {
        return {
          deliveryCharge: baseAmount,
          breakdown: {
            totalWeight: weight,
            deliveryType: 'out_of_colombo',
            baseWeight,
            baseAmount,
            additionalWeight: 0,
            additionalCharge: 0,
            description: `Out of Colombo - Up to ${baseWeight}kg`
          }
        };
      } else {
        const additionalWeight = weight - baseWeight;
        const additionalCharge = additionalWeight * perKgAmount;
        const totalCharge = baseAmount + additionalCharge;

        return {
          deliveryCharge: totalCharge,
          breakdown: {
            totalWeight: weight,
            deliveryType: 'out_of_colombo',
            baseWeight,
            baseAmount,
            additionalWeight,
            perKgAmount,
            additionalCharge,
            description: `Out of Colombo - ${baseWeight}kg @ Rs.${baseAmount} + ${additionalWeight.toFixed(2)}kg @ Rs.${perKgAmount}/kg`
          }
        };
      }

    default:
      return {
        deliveryCharge: 0,
        breakdown: {
          totalWeight: weight,
          deliveryType,
          error: 'Unknown delivery type'
        }
      };
  }
}

function calculateTotalWeight(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }

  return items.reduce((total, item) => {
    const weight = parseFloat(item.weight) || 0;
    const quantity = parseInt(item.quantity) || 1;
    return total + (weight * quantity);
  }, 0);
}

module.exports = {
  getActiveDeliverySettings,
  calculateDeliveryCharge,
  calculateTotalWeight
};
