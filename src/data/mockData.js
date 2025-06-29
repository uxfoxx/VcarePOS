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

export const mockProducts = [
  // Tables with variations
  {
    id: '1',
    name: 'Executive Dining Table',
    basePrice: 899.99,
    category: 'Tables',
    baseStock: 0, // Base product has no stock, only variations do
    barcode: 'TBL-EXE-001-OM-A7', // Smart SKU: Tables-Executive-001-Oak-Medium-Checksum
    image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Premium oak dining table with elegant design',
    baseDimensions: { length: 200, width: 100, height: 75, unit: 'cm' },
    baseWeight: 55.0,
    baseMaterial: 'Oak Wood',
    baseColor: 'Natural Oak',
    hasVariations: true,
    variations: [
      {
        id: 'VAR-1-1',
        name: '6-Seater',
        sku: 'TBL-EXE-001A-O6S-B3', // Variation A of Executive Table
        price: 899.99,
        stock: 5,
        dimensions: { length: 180, width: 90, height: 75, unit: 'cm' },
        weight: 50.0,
        material: 'Oak Wood',
        color: 'Natural Oak',
        description: '6-seater oak dining table',
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
        name: '8-Seater',
        sku: 'TBL-EXE-001B-O8S-C4', // Variation B of Executive Table
        price: 1099.99,
        stock: 3,
        dimensions: { length: 200, width: 100, height: 75, unit: 'cm' },
        weight: 55.0,
        material: 'Oak Wood',
        color: 'Natural Oak',
        description: '8-seater oak dining table',
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
        name: '8-Seater Walnut',
        sku: 'TBL-EXE-001C-W8S-D5', // Variation C with Walnut material
        price: 1299.99,
        stock: 2,
        dimensions: { length: 200, width: 100, height: 75, unit: 'cm' },
        weight: 55.0,
        material: 'Walnut Wood',
        color: 'Dark Walnut',
        description: '8-seater walnut dining table with premium finish',
        image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=300',
        rawMaterials: [
          { rawMaterialId: '1', quantity: 30 },
          { rawMaterialId: '4', quantity: 60 },
          { rawMaterialId: '7', quantity: 2.5 },
          { rawMaterialId: '8', quantity: 1.5 }
        ]
      }
    ],
    rawMaterials: [] // Base product materials are in variations
  },
  {
    id: '2',
    name: 'Modern Coffee Table',
    basePrice: 299.99,
    category: 'Tables',
    baseStock: 0,
    barcode: 'TBL-COF-002-GLM-E6', // Smart SKU: Tables-Coffee-002-Glass-Medium-Checksum
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Contemporary coffee table with modern design',
    baseDimensions: { length: 120, width: 60, height: 45, unit: 'cm' },
    baseWeight: 25.0,
    baseMaterial: 'Glass & Metal',
    baseColor: 'Clear Glass',
    hasVariations: true,
    variations: [
      {
        id: 'VAR-2-1',
        name: 'Glass Top',
        sku: 'TBL-COF-002A-GLM-F7', // Variation A of Coffee Table
        price: 299.99,
        stock: 8,
        dimensions: { length: 120, width: 60, height: 45, unit: 'cm' },
        weight: 25.0,
        material: 'Glass & Metal',
        color: 'Clear Glass',
        description: 'Glass top coffee table with metal legs',
        image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300',
        rawMaterials: [
          { rawMaterialId: '9', quantity: 4 },
          { rawMaterialId: '4', quantity: 20 }
        ]
      },
      {
        id: 'VAR-2-2',
        name: 'Wood Top',
        sku: 'TBL-COF-002B-OM-G8', // Variation B with Oak material
        price: 349.99,
        stock: 7,
        dimensions: { length: 120, width: 60, height: 45, unit: 'cm' },
        weight: 28.0,
        material: 'Oak & Metal',
        color: 'Natural Oak',
        description: 'Oak wood top coffee table with metal legs',
        image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300',
        rawMaterials: [
          { rawMaterialId: '1', quantity: 8 },
          { rawMaterialId: '9', quantity: 4 },
          { rawMaterialId: '4', quantity: 25 },
          { rawMaterialId: '8', quantity: 0.5 }
        ]
      }
    ],
    rawMaterials: []
  },
  // Chairs with variations
  {
    id: '6',
    name: 'Executive Office Chair',
    basePrice: 399.99,
    category: 'Chairs',
    baseStock: 0,
    barcode: 'CHR-EXE-003-LTM-H9', // Smart SKU: Chairs-Executive-003-Leather-Medium-Checksum
    image: 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Ergonomic executive chair with premium upholstery',
    baseDimensions: { length: 65, width: 65, height: 120, unit: 'cm' },
    baseWeight: 18.5,
    baseMaterial: 'Leather & Steel',
    baseColor: 'Black',
    hasVariations: true,
    variations: [
      {
        id: 'VAR-6-1',
        name: 'Black Leather',
        sku: 'CHR-EXE-003A-LTM-I1', // Variation A of Executive Chair
        price: 399.99,
        stock: 12,
        dimensions: { length: 65, width: 65, height: 120, unit: 'cm' },
        weight: 18.5,
        material: 'Black Leather & Steel',
        color: 'Black',
        description: 'Black leather executive chair',
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
        name: 'Brown Leather',
        sku: 'CHR-EXE-003B-LTM-J2', // Variation B with Brown color
        price: 429.99,
        stock: 8,
        dimensions: { length: 65, width: 65, height: 120, unit: 'cm' },
        weight: 18.5,
        material: 'Brown Leather & Steel',
        color: 'Brown',
        description: 'Brown leather executive chair',
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
        name: 'Fabric Mesh',
        sku: 'CHR-EXE-003C-FBM-K3', // Variation C with Fabric material
        price: 349.99,
        stock: 15,
        dimensions: { length: 65, width: 65, height: 120, unit: 'cm' },
        weight: 16.0,
        material: 'Mesh Fabric & Steel',
        color: 'Gray',
        description: 'Breathable mesh fabric executive chair',
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
  // Single product without variations
  {
    id: '3',
    name: 'Rustic Farmhouse Table',
    price: 649.99,
    category: 'Tables',
    stock: 6,
    barcode: 'TBL-FRM-004-PL-L4', // Smart SKU: Tables-Farmhouse-004-Pine-Large-Checksum
    image: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Handcrafted pine farmhouse dining table',
    dimensions: { length: 180, width: 90, height: 75, unit: 'cm' },
    weight: 45.0,
    material: 'Pine Wood',
    color: 'Natural Pine',
    hasVariations: false,
    variations: [],
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
    barcode: 'TBL-SID-005-GLS-M5', // Smart SKU: Tables-Side-005-Glass-Small-Checksum
    image: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Elegant glass side table with chrome legs',
    dimensions: { length: 50, width: 50, height: 55, unit: 'cm' },
    weight: 12.0,
    material: 'Glass & Chrome',
    color: 'Clear',
    hasVariations: false,
    variations: [],
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
    barcode: 'TBL-STD-006-OM-N6', // Smart SKU: Tables-Standing-006-Oak-Medium-Checksum
    image: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Adjustable height standing desk for office',
    dimensions: { length: 140, width: 70, height: 75, unit: 'cm' },
    weight: 35.0,
    material: 'Oak Wood & Metal',
    color: 'Oak Finish',
    hasVariations: false,
    variations: [],
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
          ...mockProducts[0],
          // Override with variation data for the transaction
          id: 'VAR-1-2',
          name: 'Executive Dining Table - 8-Seater',
          price: 1099.99,
          barcode: 'TBL-EXE-001B-O8S-C4',
          variationName: '8-Seater'
        }, 
        quantity: 1 
      },
      { 
        product: {
          ...mockProducts[2],
          // Override with variation data
          id: 'VAR-6-1',
          name: 'Executive Office Chair - Black Leather',
          price: 399.99,
          barcode: 'CHR-EXE-003A-LTM-I1',
          variationName: 'Black Leather'
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