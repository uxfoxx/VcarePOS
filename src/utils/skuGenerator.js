// SKU Generation Utility
// Format: [CATEGORY][TYPE][SEQUENCE][CHECKSUM]
// Example: TBL-EXE-001-A7 (Table, Executive, Sequence 001, Checksum A7)

const CATEGORY_CODES = {
  'Tables': 'TBL',
  'Chairs': 'CHR', 
  'Storage': 'STG',
  'Sofas & Seating': 'SFS',
  'Bedroom': 'BED',
  'Office Furniture': 'OFC'
};

const TYPE_CODES = {
  // Table types
  'dining': 'DIN',
  'coffee': 'COF',
  'office': 'OFC',
  'side': 'SID',
  'executive': 'EXE',
  'farmhouse': 'FRM',
  'standing': 'STD',
  'conference': 'CNF',
  
  // Chair types
  'office': 'OFC',
  'dining': 'DIN',
  'executive': 'EXE',
  'accent': 'ACC',
  'bar': 'BAR',
  'lounge': 'LNG',
  'recliner': 'REC',
  
  // Storage types
  'cabinet': 'CAB',
  'shelf': 'SHF',
  'wardrobe': 'WRD',
  'dresser': 'DRS',
  'bookcase': 'BKC',
  
  // Sofa types
  'sectional': 'SEC',
  'loveseat': 'LVS',
  'sofa': 'SFA',
  'ottoman': 'OTM',
  
  // Bedroom types
  'bed': 'BED',
  'nightstand': 'NGT',
  'dresser': 'DRS',
  'mirror': 'MIR',
  
  // Default
  'standard': 'STD'
};

const MATERIAL_CODES = {
  'oak': 'O',
  'pine': 'P', 
  'walnut': 'W',
  'mahogany': 'M',
  'teak': 'T',
  'bamboo': 'B',
  'metal': 'MT',
  'glass': 'GL',
  'leather': 'LT',
  'fabric': 'FB',
  'plastic': 'PL',
  'composite': 'CP'
};

const SIZE_CODES = {
  'small': 'S',
  'medium': 'M', 
  'large': 'L',
  'extra-large': 'XL',
  '2-seater': '2S',
  '4-seater': '4S',
  '6-seater': '6S',
  '8-seater': '8S'
};

// Generate checksum for SKU validation
function generateChecksum(sku) {
  let sum = 0;
  for (let i = 0; i < sku.length; i++) {
    sum += sku.charCodeAt(i) * (i + 1);
  }
  const checksum = (sum % 36).toString(36).toUpperCase();
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

// Extract material from product data
function extractMaterial(product) {
  const material = (product.material || product.baseMaterial || '').toLowerCase();
  
  for (const [materialName, code] of Object.entries(MATERIAL_CODES)) {
    if (material.includes(materialName)) {
      return code;
    }
  }
  
  return 'X'; // Unknown material
}

// Extract size information
function extractSize(product) {
  const name = product.name.toLowerCase();
  const description = (product.description || '').toLowerCase();
  
  // Check for seater information first
  for (const [size, code] of Object.entries(SIZE_CODES)) {
    if (name.includes(size) || description.includes(size)) {
      return code;
    }
  }
  
  // Check dimensions if available
  if (product.dimensions || product.baseDimensions) {
    const dims = product.dimensions || product.baseDimensions;
    if (dims.length && dims.width) {
      const area = dims.length * dims.width;
      if (area < 5000) return SIZE_CODES.small;
      if (area < 15000) return SIZE_CODES.medium;
      if (area < 30000) return SIZE_CODES.large;
      return SIZE_CODES['extra-large'];
    }
  }
  
  return SIZE_CODES.medium; // Default
}

// Get next sequence number for a category
function getNextSequence(category, existingProducts = []) {
  const categoryCode = CATEGORY_CODES[category] || 'GEN';
  
  // Find existing SKUs for this category
  const existingSKUs = existingProducts
    .filter(p => p.barcode && p.barcode.startsWith(categoryCode))
    .map(p => p.barcode);
  
  // Extract sequence numbers
  const sequences = existingSKUs
    .map(sku => {
      const parts = sku.split('-');
      if (parts.length >= 3) {
        const seqPart = parts[2];
        const num = parseInt(seqPart, 10);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    })
    .filter(num => num > 0);
  
  // Get next sequence
  const maxSequence = sequences.length > 0 ? Math.max(...sequences) : 0;
  return (maxSequence + 1).toString().padStart(3, '0');
}

// Generate main product SKU
export function generateProductSKU(product, existingProducts = []) {
  const category = product.category || 'Tables';
  const categoryCode = CATEGORY_CODES[category] || 'GEN';
  const typeCode = extractProductType(product.name);
  const sequence = getNextSequence(category, existingProducts);
  const materialCode = extractMaterial(product);
  const sizeCode = extractSize(product);
  
  // Base SKU without checksum
  const baseSKU = `${categoryCode}-${typeCode}-${sequence}-${materialCode}${sizeCode}`;
  
  // Generate checksum
  const checksum = generateChecksum(baseSKU);
  
  // Final SKU
  return `${baseSKU}-${checksum}`;
}

// Generate variation SKU (inherits from parent but adds variation identifier)
export function generateVariationSKU(baseProduct, variation, variationIndex, existingProducts = []) {
  const category = baseProduct.category || 'Tables';
  const categoryCode = CATEGORY_CODES[category] || 'GEN';
  const typeCode = extractProductType(baseProduct.name);
  const sequence = getNextSequence(category, existingProducts);
  const materialCode = extractMaterial(variation);
  const sizeCode = extractSize({ ...baseProduct, ...variation });
  
  // Add variation identifier (A, B, C, etc.)
  const variationId = String.fromCharCode(65 + variationIndex); // A, B, C...
  
  // Base SKU without checksum
  const baseSKU = `${categoryCode}-${typeCode}-${sequence}${variationId}-${materialCode}${sizeCode}`;
  
  // Generate checksum
  const checksum = generateChecksum(baseSKU);
  
  // Final SKU
  return `${baseSKU}-${checksum}`;
}

// Parse SKU to extract information
export function parseSKU(sku) {
  if (!sku || typeof sku !== 'string') {
    return null;
  }
  
  const parts = sku.split('-');
  if (parts.length < 4) {
    return null;
  }
  
  const [categoryCode, typeCode, sequencePart, materialSizePart, checksumPart] = parts;
  
  // Find category name
  const categoryName = Object.keys(CATEGORY_CODES).find(
    key => CATEGORY_CODES[key] === categoryCode
  ) || 'Unknown';
  
  // Find type name
  const typeName = Object.keys(TYPE_CODES).find(
    key => TYPE_CODES[key] === typeCode
  ) || 'Unknown';
  
  // Extract sequence and variation
  const sequenceMatch = sequencePart.match(/^(\d{3})([A-Z]?)$/);
  const sequence = sequenceMatch ? sequenceMatch[1] : sequencePart;
  const variationId = sequenceMatch ? sequenceMatch[2] : '';
  
  // Extract material and size
  const materialCode = materialSizePart.slice(0, -1) || materialSizePart.slice(0, -2);
  const sizeCode = materialSizePart.slice(-1) || materialSizePart.slice(-2);
  
  // Find material name
  const materialName = Object.keys(MATERIAL_CODES).find(
    key => MATERIAL_CODES[key] === materialCode
  ) || 'Unknown';
  
  // Find size name
  const sizeName = Object.keys(SIZE_CODES).find(
    key => SIZE_CODES[key] === sizeCode
  ) || 'Unknown';
  
  return {
    category: categoryName,
    type: typeName,
    sequence: parseInt(sequence, 10),
    variation: variationId,
    material: materialName,
    size: sizeName,
    isVariation: !!variationId,
    checksum: checksumPart
  };
}

// Validate SKU checksum
export function validateSKU(sku) {
  if (!sku || typeof sku !== 'string') {
    return false;
  }
  
  const parts = sku.split('-');
  if (parts.length < 4) {
    return false;
  }
  
  const checksumPart = parts[parts.length - 1];
  const baseSKU = parts.slice(0, -1).join('-');
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
    parsed.type,
    parsed.material,
    parsed.size
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
  const primarySKU = generateProductSKU(product, existingProducts);
  suggestions.push({
    sku: primarySKU,
    description: describeSKU(primarySKU),
    confidence: 'high'
  });
  
  // Alternative suggestions with different type codes
  const alternativeTypes = Object.keys(TYPE_CODES).filter(type => 
    product.name.toLowerCase().includes(type) && type !== extractProductType(product.name)
  );
  
  alternativeTypes.slice(0, 2).forEach(type => {
    const altProduct = { ...product, name: product.name + ' ' + type };
    const altSKU = generateProductSKU(altProduct, existingProducts);
    suggestions.push({
      sku: altSKU,
      description: describeSKU(altSKU),
      confidence: 'medium'
    });
  });
  
  return suggestions;
}