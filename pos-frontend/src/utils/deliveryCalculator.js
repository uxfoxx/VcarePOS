export function calculateTotalWeight(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }

  return items.reduce((total, item) => {
    const weight = parseFloat(item.weight) || 0;
    const quantity = parseInt(item.quantity) || 1;
    return total + (weight * quantity);
  }, 0);
}

export function calculateDeliveryCharge(weight, deliveryType, settings) {
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

  if (!settings) {
    return {
      deliveryCharge: 0,
      breakdown: {
        totalWeight: weight,
        deliveryType,
        error: 'Settings not available'
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

    case 'inside_colombo': {
      const insideColomboAmount = parseFloat(settings.inside_colombo_amount) || 0;
      return {
        deliveryCharge: insideColomboAmount,
        breakdown: {
          totalWeight: weight,
          deliveryType: 'inside_colombo',
          flatRate: insideColomboAmount,
          description: `Inside Colombo - Flat rate`
        }
      };
    }

    case 'out_of_colombo': {
      const baseWeight = parseFloat(settings.out_of_colombo_base_weight) || 0;
      const baseAmount = parseFloat(settings.out_of_colombo_base_amount) || 0;
      const perKgAmount = parseFloat(settings.out_of_colombo_per_kg_amount) || 0;

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

export function formatWeight(weight) {
  const w = parseFloat(weight) || 0;
  return w.toFixed(2);
}

export function formatCurrency(amount) {
  const a = parseFloat(amount) || 0;
  return `Rs. ${a.toFixed(2)}`;
}
