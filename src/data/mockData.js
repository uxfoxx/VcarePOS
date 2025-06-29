export const mockRawMaterials = [
  {
    id: '1',
    name: 'Oak Wood Planks',
    category: 'Wood',
    unit: 'sq ft',
    stockQuantity: 500,
    unitPrice: 12.50,
    supplier: 'Premium Wood Co.',
    minimumStock: 50,
    description: 'High-quality oak wood planks for table making'
  },
  {
    id: '2',
    name: 'Pine Wood Boards',
    category: 'Wood',
    unit: 'sq ft',
    stockQuantity: 750,
    unitPrice: 8.75,
    supplier: 'Forest Materials Ltd.',
    minimumStock: 100,
    description: 'Sustainable pine wood boards for chairs'
  },
  {
    id: '3',
    name: 'Steel Hinges',
    category: 'Hardware',
    unit: 'pieces',
    stockQuantity: 200,
    unitPrice: 3.25,
    supplier: 'MetalWorks Inc.',
    minimumStock: 25,
    description: 'Heavy-duty steel hinges for table extensions'
  },
  {
    id: '4',
    name: 'Wood Screws',
    category: 'Hardware',
    unit: 'pieces',
    stockQuantity: 1000,
    unitPrice: 0.15,
    supplier: 'FastenRight Co.',
    minimumStock: 100,
    description: 'Premium wood screws for furniture assembly'
  },
  {
    id: '5',
    name: 'Foam Padding',
    category: 'Upholstery',
    unit: 'sq ft',
    stockQuantity: 300,
    unitPrice: 4.50,
    supplier: 'Comfort Materials',
    minimumStock: 50,
    description: 'High-density foam for chair cushions'
  },
  {
    id: '6',
    name: 'Leather Fabric',
    category: 'Upholstery',
    unit: 'sq ft',
    stockQuantity: 150,
    unitPrice: 25.00,
    supplier: 'Premium Leather Co.',
    minimumStock: 20,
    description: 'Genuine leather fabric for premium chairs'
  },
  {
    id: '7',
    name: 'Wood Stain - Walnut',
    category: 'Finishing',
    unit: 'liters',
    stockQuantity: 50,
    unitPrice: 18.00,
    supplier: 'ColorCraft Finishes',
    minimumStock: 10,
    description: 'Professional walnut wood stain for tables'
  },
  {
    id: '8',
    name: 'Polyurethane Finish',
    category: 'Finishing',
    unit: 'liters',
    stockQuantity: 40,
    unitPrice: 22.50,
    supplier: 'ProtectCoat Ltd.',
    minimumStock: 8,
    description: 'Clear polyurethane protective finish'
  },
  {
    id: '9',
    name: 'Table Legs - Metal',
    category: 'Hardware',
    unit: 'pieces',
    stockQuantity: 80,
    unitPrice: 15.00,
    supplier: 'MetalWorks Inc.',
    minimumStock: 20,
    description: 'Sturdy metal table legs'
  },
  {
    id: '10',
    name: 'Chair Casters',
    category: 'Hardware',
    unit: 'pieces',
    stockQuantity: 120,
    unitPrice: 8.50,
    supplier: 'RollTech Solutions',
    minimumStock: 30,
    description: 'High-quality chair casters for office chairs'
  }
];

export const mockCategories = [
  {
    id: 'CAT-001',
    name: 'Tables',
    description: 'All types of tables including dining, coffee, and office tables',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'CAT-002',
    name: 'Chairs',
    description: 'Seating furniture including office chairs, dining chairs, and accent chairs',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'CAT-003',
    name: 'Storage',
    description: 'Storage solutions including cabinets, shelves, and wardrobes',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'CAT-004',
    name: 'Sofas & Seating',
    description: 'Comfortable seating including sofas, loveseats, and recliners',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'CAT-005',
    name: 'Bedroom',
    description: 'Bedroom furniture including beds, nightstands, and dressers',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'CAT-006',
    name: 'Office Furniture',
    description: 'Professional office furniture and accessories',
    isActive: false,
    createdAt: new Date('2024-01-01')
  }
];

// Variant Types - Define the types of variants available
export const mockVariantTypes = [
  {
    id: 'VT-001',
    name: 'Size',
    description: 'Product size variations',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'VT-002',
    name: 'Color',
    description: 'Product color variations',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'VT-003',
    name: 'Material',
    description: 'Product material variations',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'VT-004',
    name: 'Style',
    description: 'Product style variations',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'VT-005',
    name: 'Finish',
    description: 'Product finish variations',
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
];

// Variant Options - Specific options for each variant type
export const mockVariantOptions = [
  // Size options
  {
    id: 'VO-001',
    variantTypeId: 'VT-001',
    name: 'Small',
    value: 'small',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'VO-002',
    variantTypeId: 'VT-001',
    name: 'Medium',
    value: 'medium',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'VO-003',
    variantTypeId: 'VT-001',
    name: 'Large',
    value: 'large',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'VO-004',
    variantTypeId: 'VT-001',
    name: 'Extra Large',
    value: 'xl',
    sortOrder: 4,
    isActive: true
  },
  // Color options
  {
    id: 'VO-005',
    variantTypeId: 'VT-002',
    name: 'Natural Oak',
    value: 'natural-oak',
    colorCode: '#D2B48C',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'VO-006',
    variantTypeId: 'VT-002',
    name: 'Dark Walnut',
    value: 'dark-walnut',
    colorCode: '#5D4037',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'VO-007',
    variantTypeId: 'VT-002',
    name: 'Black',
    value: 'black',
    colorCode: '#000000',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'VO-008',
    variantTypeId: 'VT-002',
    name: 'White',
    value: 'white',
    colorCode: '#FFFFFF',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'VO-009',
    variantTypeId: 'VT-002',
    name: 'Brown Leather',
    value: 'brown-leather',
    colorCode: '#8B4513',
    sortOrder: 5,
    isActive: true
  },
  {
    id: 'VO-010',
    variantTypeId: 'VT-002',
    name: 'Gray Fabric',
    value: 'gray-fabric',
    colorCode: '#808080',
    sortOrder: 6,
    isActive: true
  },
  // Material options
  {
    id: 'VO-011',
    variantTypeId: 'VT-003',
    name: 'Oak Wood',
    value: 'oak-wood',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'VO-012',
    variantTypeId: 'VT-003',
    name: 'Pine Wood',
    value: 'pine-wood',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'VO-013',
    variantTypeId: 'VT-003',
    name: 'Metal Frame',
    value: 'metal-frame',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'VO-014',
    variantTypeId: 'VT-003',
    name: 'Leather',
    value: 'leather',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'VO-015',
    variantTypeId: 'VT-003',
    name: 'Fabric',
    value: 'fabric',
    sortOrder: 5,
    isActive: true
  }
];

export const mockProducts = [
  // Product with multiple variant types (Size + Color)
  {
    id: '1',
    name: 'Executive Dining Table',
    basePrice: 899.99,
    category: 'Tables',
    barcode: 'TE01MZ',
    image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Premium oak dining table with elegant design',
    baseDimensions: { length: 200, width: 100, height: 75, unit: 'cm' },
    baseWeight: 55.0,
    hasVariants: true,
    variantTypes: ['VT-001', 'VT-002'], // Size and Color
    variants: [
      {
        id: 'VAR-1-1',
        sku: 'TE01A3K',
        combination: { 'VT-001': 'VO-002', 'VT-002': 'VO-005' }, // Medium + Natural Oak
        price: 899.99,
        stock: 5,
        dimensions: { length: 180, width: 90, height: 75, unit: 'cm' },
        weight: 50.0,
        image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=300',
        rawMaterials: [
          { rawMaterialId: '1', quantity: 25 },
          { rawMaterialId: '4', quantity: 50 },
          { rawMaterialId: '7', quantity: 1.5 },
          { rawMaterialId: '8', quantity: 1 }
        ]
      },
      {
        id: 'VAR-1-2',
        sku: 'TE01B4L',
        combination: { 'VT-001': 'VO-003', 'VT-002': 'VO-005' }, // Large + Natural Oak
        price: 1099.99,
        stock: 3,
        dimensions: { length: 200, width: 100, height: 75, unit: 'cm' },
        weight: 55.0,
        image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=300',
        rawMaterials: [
          { rawMaterialId: '1', quantity: 30 },
          { rawMaterialId: '4', quantity: 60 },
          { rawMaterialId: '7', quantity: 2 },
          { rawMaterialId: '8', quantity: 1 }
        ]
      },
      {
        id: 'VAR-1-3',
        sku: 'TE01C5M',
        combination: { 'VT-001': 'VO-003', 'VT-002': 'VO-006' }, // Large + Dark Walnut
        price: 1299.99,
        stock: 2,
        dimensions: { length: 200, width: 100, height: 75, unit: 'cm' },
        weight: 55.0,
        image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=300',
        rawMaterials: [
          { rawMaterialId: '1', quantity: 30 },
          { rawMaterialId: '4', quantity: 60 },
          { rawMaterialId: '7', quantity: 2.5 },
          { rawMaterialId: '8', quantity: 1.5 }
        ]
      }
    ],
    rawMaterials: []
  },
  // Product with Color + Material variants
  {
    id: '6',
    name: 'Executive Office Chair',
    basePrice: 399.99,
    category: 'Chairs',
    barcode: 'CE01Q2',
    image: 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Ergonomic executive chair with premium upholstery',
    baseDimensions: { length: 65, width: 65, height: 120, unit: 'cm' },
    baseWeight: 18.5,
    hasVariants: true,
    variantTypes: ['VT-002', 'VT-003'], // Color and Material
    variants: [
      {
        id: 'VAR-6-1',
        sku: 'CE01AR3',
        combination: { 'VT-002': 'VO-007', 'VT-003': 'VO-014' }, // Black + Leather
        price: 399.99,
        stock: 12,
        dimensions: { length: 65, width: 65, height: 120, unit: 'cm' },
        weight: 18.5,
        image: 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300',
        rawMaterials: [
          { rawMaterialId: '6', quantity: 3 },
          { rawMaterialId: '5', quantity: 2 },
          { rawMaterialId: '10', quantity: 5 },
          { rawMaterialId: '4', quantity: 25 }
        ]
      },
      {
        id: 'VAR-6-2',
        sku: 'CE01BS4',
        combination: { 'VT-002': 'VO-009', 'VT-003': 'VO-014' }, // Brown Leather + Leather
        price: 429.99,
        stock: 8,
        dimensions: { length: 65, width: 65, height: 120, unit: 'cm' },
        weight: 18.5,
        image: 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300',
        rawMaterials: [
          { rawMaterialId: '6', quantity: 3.5 },
          { rawMaterialId: '5', quantity: 2 },
          { rawMaterialId: '10', quantity: 5 },
          { rawMaterialId: '4', quantity: 25 }
        ]
      },
      {
        id: 'VAR-6-3',
        sku: 'CE01CT5',
        combination: { 'VT-002': 'VO-010', 'VT-003': 'VO-015' }, // Gray Fabric + Fabric
        price: 349.99,
        stock: 15,
        dimensions: { length: 65, width: 65, height: 120, unit: 'cm' },
        weight: 16.0,
        image: 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300',
        rawMaterials: [
          { rawMaterialId: '5', quantity: 1.5 },
          { rawMaterialId: '10', quantity: 5 },
          { rawMaterialId: '4', quantity: 20 }
        ]
      }
    ],
    rawMaterials: []
  },
  // Single product without variants
  {
    id: '3',
    name: 'Rustic Farmhouse Table',
    price: 649.99,
    category: 'Tables',
    stock: 6,
    barcode: 'TF03U6',
    image: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Handcrafted pine farmhouse dining table',
    dimensions: { length: 180, width: 90, height: 75, unit: 'cm' },
    weight: 45.0,
    material: 'Pine Wood',
    color: 'Natural Pine',
    hasVariants: false,
    variantTypes: [],
    variants: [],
    rawMaterials: [
      { rawMaterialId: '2', quantity: 25 },
      { rawMaterialId: '4', quantity: 50 },
      { rawMaterialId: '7', quantity: 2 },
      { rawMaterialId: '8', quantity: 1 }
    ]
  },
  {
    id: '4',
    name: 'Glass Side Table',
    price: 199.99,
    category: 'Tables',
    stock: 12,
    barcode: 'T404V7',
    image: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Elegant glass side table with chrome legs',
    dimensions: { length: 50, width: 50, height: 55, unit: 'cm' },
    weight: 12.0,
    material: 'Glass & Chrome',
    color: 'Clear',
    hasVariants: false,
    variantTypes: [],
    variants: [],
    rawMaterials: [
      { rawMaterialId: '9', quantity: 4 },
      { rawMaterialId: '4', quantity: 10 }
    ]
  },
  {
    id: '5',
    name: 'Standing Desk',
    price: 549.99,
    category: 'Tables',
    stock: 10,
    barcode: 'TS05W8',
    image: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Adjustable height standing desk for office',
    dimensions: { length: 140, width: 70, height: 75, unit: 'cm' },
    weight: 35.0,
    material: 'Oak Wood & Metal',
    color: 'Oak Finish',
    hasVariants: false,
    variantTypes: [],
    variants: [],
    rawMaterials: [
      { rawMaterialId: '1', quantity: 15 },
      { rawMaterialId: '9', quantity: 4 },
      { rawMaterialId: '4', quantity: 30 },
      { rawMaterialId: '8', quantity: 1 }
    ]
  }
];

export const mockTransactions = [
  {
    id: 'TXN-001',
    items: [
      { 
        product: {
          id: 'VAR-1-2',
          name: 'Executive Dining Table',
          price: 1099.99,
          barcode: 'TE01B4L',
          category: 'Tables',
          selectedVariants: { 'VT-001': 'VO-003', 'VT-002': 'VO-005' }, // Large + Natural Oak
          variantDisplay: 'Large, Natural Oak'
        }, 
        quantity: 1 
      },
      { 
        product: {
          id: 'VAR-6-1',
          name: 'Executive Office Chair',
          price: 399.99,
          barcode: 'CE01AR3',
          category: 'Chairs',
          selectedVariants: { 'VT-002': 'VO-007', 'VT-003': 'VO-014' }, // Black + Leather
          variantDisplay: 'Black, Leather'
        }, 
        quantity: 4 
      }
    ],
    subtotal: 2699.95,
    categoryTaxTotal: 0,
    fullBillTaxTotal: 215.996,
    totalTax: 215.996,
    discount: 0,
    total: 2915.95,
    paymentMethod: 'card',
    timestamp: new Date('2024-01-15T10:30:00'),
    cashier: 'Sarah Wilson',
    salesperson: 'Jane Smith',
    customerName: 'John Smith',
    customerPhone: '+1-555-0123',
    customerEmail: 'john.smith@email.com',
    customerAddress: '123 Main St, City, State 12345',
    status: 'completed',
    notes: 'Customer requested white glove delivery service'
  }
];

export const mockCoupons = [
  {
    id: 'COUPON-001',
    code: 'WELCOME10',
    description: 'Welcome discount for new customers',
    discountType: 'percentage',
    discountPercent: 10,
    discountAmount: 0,
    minimumAmount: 100,
    maxDiscount: 50,
    usageLimit: 100,
    usedCount: 16,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    isActive: true,
    applicableCategories: [],
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'COUPON-002',
    code: 'FURNITURE20',
    description: '20% off on all furniture items',
    discountType: 'percentage',
    discountPercent: 20,
    discountAmount: 0,
    minimumAmount: 500,
    maxDiscount: 200,
    usageLimit: 50,
    usedCount: 8,
    validFrom: new Date('2024-01-15'),
    validTo: new Date('2024-02-15'),
    isActive: true,
    applicableCategories: ['Tables', 'Chairs'],
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'COUPON-003',
    code: 'CHAIRS15',
    description: '15% discount on all chairs',
    discountType: 'percentage',
    discountPercent: 15,
    discountAmount: 0,
    minimumAmount: 200,
    maxDiscount: 100,
    usageLimit: null,
    usedCount: 25,
    validFrom: new Date('2024-01-01'),
    validTo: null,
    isActive: true,
    applicableCategories: ['Chairs'],
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'COUPON-004',
    code: 'EXPIRED50',
    description: 'Expired 50% discount coupon',
    discountType: 'percentage',
    discountPercent: 50,
    discountAmount: 0,
    minimumAmount: 1000,
    maxDiscount: 500,
    usageLimit: 10,
    usedCount: 10,
    validFrom: new Date('2023-12-01'),
    validTo: new Date('2023-12-31'),
    isActive: false,
    applicableCategories: [],
    createdAt: new Date('2023-12-01')
  }
];

export const mockTaxes = [
  {
    id: 'TAX-001',
    name: 'Sales Tax',
    description: 'Standard sales tax applied to all orders',
    rate: 8.0,
    taxType: 'full_bill',
    isActive: true,
    isDefault: true,
    applicableCategories: [],
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'TAX-002',
    name: 'Luxury Furniture Tax',
    description: 'Additional tax for luxury furniture items over $500',
    rate: 5.0,
    taxType: 'category',
    isActive: true,
    isDefault: false,
    applicableCategories: ['Tables'],
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'TAX-003',
    name: 'Premium Seating Tax',
    description: 'Tax for premium seating products',
    rate: 3.0,
    taxType: 'category',
    isActive: true,
    isDefault: false,
    applicableCategories: ['Chairs'],
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'TAX-004',
    name: 'Environmental Tax',
    description: 'Environmental impact tax for all furniture',
    rate: 2.0,
    taxType: 'full_bill',
    isActive: false,
    isDefault: false,
    applicableCategories: [],
    createdAt: new Date('2024-01-01')
  }
];