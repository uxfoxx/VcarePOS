// Compact SKU Generation Utility - Max 8 Characters
// Format: [CAT][TYPE][SEQ][CHK] 
// Example: T1E01A7 (Tables-Executive-001-Checksum A7)

const CATEGORY_CODES = {
  'Tables': 'T',
  'Chairs': 'C', 
  'Storage': 'S',
  'Sofas & Seating': 'F',
  'Bedroom': 'B',
  'Office Furniture': 'O'
};

const TYPE_CODES = {
  // Table types (T + number)
  'dining': '1',
  'coffee': '2',
  'office': '3',
  'side': '4',
  'executive': 'E',
  'farmhouse': 'F',
  'standing': 'S',
  'conference': 'C',
  
  // Chair types (C + number)
  'office': '1',
  'dining': '2',
  'executive': 'E',
  'accent': 'A',
  'bar': 'B',
  'lounge': 'L',
  'recliner': 'R',
  
  // Storage types (S + number)
  'cabinet': '1',
  'shelf': '2',
  'wardrobe': '3',
  'dresser': '4',
  'bookcase': '5',
  
  // Sofa types (F + number)
  'sectional': '1',
  'loveseat': '2',
  'sofa': '3',
  'ottoman': '4',
  
  // Bedroom types (B + number)
  'bed': '1',
  'nightstand': '2',
  'dresser': '3',
  'mirror': '4',
  
  // Default
  'standard': '0'
};

// Generate compact checksum (2 characters)
function generateChecksum(sku) {
  let sum = 0;
  for (let i = 0; i < sku.length; i++) {
    sum += sku.charCodeAt(i) * (i + 1);
  }
  const checksum = (sum % 1296).toString(36).toUpperCase(); // Base 36 for 2 chars max
  return checksum.length === 1 ? '0' + checksum : checksum.slice(-2);
}

// Extract product type from name
function extractProductType(name) {
  const nameLower = name.toLowerCase();
  
  // Check for specific types in the product name
  for (const [type, code] of Object.entries(TYPE_CODES)) {
    if (nameLower.includes(type)) {
      return code;
    }
  }
  
  // Fallback to standard
  return TYPE_CODES.standard;
}

// Get next sequence number for a category (2 digits: 01-99)
function getNextSequence(category, existingProducts = []) {
  const categoryCode = CATEGORY_CODES[category] || 'G';
  
  // Find existing SKUs for this category
  const existingSKUs = existingProducts
    .filter(p => p.barcode && p.barcode.startsWith(categoryCode))
    .map(p => p.barcode);
  
  // Extract sequence numbers (positions 2-3 in 8-char SKU)
  const sequences = existingSKUs
    .map(sku => {
      if (sku.length >= 4) {
        const seqPart = sku.substring(2, 4);
        const num = parseInt(seqPart, 10);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    })
    .filter(num => num > 0);
  
  // Get next sequence
  const maxSequence = sequences.length > 0 ? Math.max(...sequences) : 0;
  const nextSeq = maxSequence + 1;
  
  // Ensure we don't exceed 99
  if (nextSeq > 99) {
    throw new Error('Maximum products reached for this category (99)');
  }
  
  return nextSeq.toString().padStart(2, '0');
}

// Generate main product SKU (8 characters: CTSSCC)
// C = Category (1 char), T = Type (1 char), SS = Sequence (2 chars), CC = Checksum (2 chars)
export function generateProductSKU(product, existingProducts = []) {
  const category = product.category || 'Tables';
  const categoryCode = CATEGORY_CODES[category] || 'G';
  const typeCode = extractProductType(product.name);
  const sequence = getNextSequence(category, existingProducts);
  
  // Base SKU without checksum (4 chars)
  const baseSKU = `${categoryCode}${typeCode}${sequence}`;
  
  // Generate checksum (2 chars)
  const checksum = generateChecksum(baseSKU);
  
  // Final SKU (6 chars total)
  return `${baseSKU}${checksum}`;
}

// Generate variation SKU (adds variation letter: CTSSACC)
// C = Category, T = Type, SS = Sequence, A = Variation (A,B,C...), CC = Checksum
export function generateVariationSKU(baseProduct, variation, variationIndex, existingProducts = []) {
  const category = baseProduct.category || 'Tables';
  const categoryCode = CATEGORY_CODES[category] || 'G';
  const typeCode = extractProductType(baseProduct.name);
  const sequence = getNextSequence(category, existingProducts);
  
  // Add variation identifier (A, B, C, etc.)
  const variationId = String.fromCharCode(65 + variationIndex); // A, B, C...
  
  // Base SKU without checksum (5 chars)
  const baseSKU = `${categoryCode}${typeCode}${sequence}${variationId}`;
  
  // Generate checksum (2 chars)
  const checksum = generateChecksum(baseSKU);
  
  // Final SKU (7 chars total)
  return `${baseSKU}${checksum}`;
}

// Parse SKU to extract information
export function parseSKU(sku) {
  if (!sku || typeof sku !== 'string' || sku.length < 6) {
    return null;
  }
  
  const categoryCode = sku[0];
  const typeCode = sku[1];
  const sequence = sku.substring(2, 4);
  
  let variationId = '';
  let checksumPart = '';
  
  if (sku.length === 6) {
    // No variation: CTSSCC
    checksumPart = sku.substring(4, 6);
  } else if (sku.length === 7) {
    // With variation: CTSSACC
    variationId = sku[4];
    checksumPart = sku.substring(5, 7);
  } else {
    return null;
  }
  
  // Find category name
  const categoryName = Object.keys(CATEGORY_CODES).find(
    key => CATEGORY_CODES[key] === categoryCode
  ) || 'Unknown';
  
  // Find type name
  const typeName = Object.keys(TYPE_CODES).find(
    key => TYPE_CODES[key] === typeCode
  ) || 'Unknown';
  
  return {
    category: categoryName,
    type: typeName,
    sequence: parseInt(sequence, 10),
    variation: variationId,
    isVariation: !!variationId,
    checksum: checksumPart
  };
}

// Validate SKU checksum
export function validateSKU(sku) {
  if (!sku || typeof sku !== 'string' || sku.length < 6 || sku.length > 7) {
    return false;
  }
  
  const checksumPart = sku.slice(-2);
  const baseSKU = sku.slice(0, -2);
  const expectedChecksum = generateChecksum(baseSKU);
  
  return checksumPart === expectedChecksum;
}

// Generate human-readable SKU description
export function describeSKU(sku) {
  const parsed = parseSKU(sku);
  if (!parsed) {
    return 'Invalid SKU';
  }
  
  const parts = [
    parsed.category,
    parsed.type
  ].filter(part => part !== 'Unknown');
  
  let description = parts.join(' ');
  
  if (parsed.isVariation) {
    description += ` (Variation ${parsed.variation})`;
  }
  
  description += ` #${parsed.sequence}`;
  
  return description;
}

// Get SKU suggestions based on product data
export function getSKUSuggestions(product, existingProducts = []) {
  const suggestions = [];
  
  // Primary suggestion
  try {
    const primarySKU = generateProductSKU(product, existingProducts);
    suggestions.push({
      sku: primarySKU,
      description: describeSKU(primarySKU),
      confidence: 'high'
    });
  } catch (error) {
    // Handle case where max products reached
  }
  
  // Alternative suggestions with different type codes
  const alternativeTypes = Object.keys(TYPE_CODES).filter(type => 
    product.name.toLowerCase().includes(type) && type !== extractProductType(product.name)
  );
  
  alternativeTypes.slice(0, 2).forEach(type => {
    try {
      const altProduct = { ...product, name: product.name + ' ' + type };
      const altSKU = generateProductSKU(altProduct, existingProducts);
      suggestions.push({
        sku: altSKU,
        description: describeSKU(altSKU),
        confidence: 'medium'
      });
    } catch (error) {
      // Skip if error
    }
  });
  
  return suggestions;
}