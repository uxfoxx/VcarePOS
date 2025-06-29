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
  },
  {
    id: '11',
    name: 'Velvet Fabric',
    category: 'Upholstery',
    unit: 'sq ft',
    stockQuantity: 200,
    unitPrice: 18.75,
    supplier: 'Luxury Fabrics Inc.',
    minimumStock: 30,
    description: 'Premium velvet fabric for luxury furniture'
  },
  {
    id: '12',
    name: 'Brass Handles',
    category: 'Hardware',
    unit: 'pieces',
    stockQuantity: 150,
    unitPrice: 5.25,
    supplier: 'MetalWorks Inc.',
    minimumStock: 25,
    description: 'Decorative brass handles for drawers and cabinets'
  },
  {
    id: '13',
    name: 'Maple Wood Planks',
    category: 'Wood',
    unit: 'sq ft',
    stockQuantity: 350,
    unitPrice: 14.75,
    supplier: 'Premium Wood Co.',
    minimumStock: 40,
    description: 'High-quality maple wood for premium furniture'
  },
  {
    id: '14',
    name: 'Glass Panels',
    category: 'Materials',
    unit: 'sq ft',
    stockQuantity: 100,
    unitPrice: 22.00,
    supplier: 'Crystal Glass Co.',
    minimumStock: 15,
    description: 'Tempered glass panels for tables and cabinets'
  },
  {
    id: '15',
    name: 'Drawer Slides',
    category: 'Hardware',
    unit: 'pairs',
    stockQuantity: 80,
    unitPrice: 7.50,
    supplier: 'FastenRight Co.',
    minimumStock: 20,
    description: 'Smooth-gliding drawer slides for cabinets'
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
  // Product with size variants
  {
    id: '1',
    name: 'Executive Dining Table',
    price: 899.99,
    category: 'Tables',
    stock: 15,
    barcode: 'TE01MZ',
    image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Premium oak dining table with elegant design',
    dimensions: { length: 200, width: 100, height: 75, unit: 'cm' },
    weight: 55.0,
    material: 'Oak Wood',
    color: 'Natural Oak',
    hasSizes: true,
    sizes: [
      {
        id: 'SIZE-1-1',
        name: 'Small',
        price: 799.99,
        stock: 5,
        dimensions: { length: 150, width: 80, height: 75, unit: 'cm' },
        weight: 40.0
      },
      {
        id: 'SIZE-1-2',
        name: 'Medium',
        price: 899.99,
        stock: 6,
        dimensions: { length: 180, width: 90, height: 75, unit: 'cm' },
        weight: 50.0
      },
      {
        id: 'SIZE-1-3',
        name: 'Large',
        price: 1099.99,
        stock: 4,
        dimensions: { length: 200, width: 100, height: 75, unit: 'cm' },
        weight: 55.0
      }
    ],
    rawMaterials: [
      { rawMaterialId: '1', quantity: 25 },
      { rawMaterialId: '4', quantity: 50 },
      { rawMaterialId: '7', quantity: 1.5 },
      { rawMaterialId: '8', quantity: 1 }
    ]
  },
  // Product with size variants
  {
    id: '2',
    name: 'Executive Office Chair',
    price: 399.99,
    category: 'Chairs',
    stock: 25,
    barcode: 'CE01Q2',
    image: 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Ergonomic executive chair with premium upholstery',
    dimensions: { length: 65, width: 65, height: 120, unit: 'cm' },
    weight: 18.5,
    material: 'Leather',
    color: 'Black',
    hasSizes: true,
    sizes: [
      {
        id: 'SIZE-2-1',
        name: 'Standard',
        price: 399.99,
        stock: 12,
        dimensions: { length: 65, width: 65, height: 120, unit: 'cm' },
        weight: 18.5
      },
      {
        id: 'SIZE-2-2',
        name: 'Large',
        price: 449.99,
        stock: 8,
        dimensions: { length: 70, width: 70, height: 125, unit: 'cm' },
        weight: 20.0
      },
      {
        id: 'SIZE-2-3',
        name: 'Extra Large',
        price: 499.99,
        stock: 5,
        dimensions: { length: 75, width: 75, height: 130, unit: 'cm' },
        weight: 22.0
      }
    ],
    rawMaterials: [
      { rawMaterialId: '6', quantity: 3 },
      { rawMaterialId: '5', quantity: 2 },
      { rawMaterialId: '10', quantity: 5 },
      { rawMaterialId: '4', quantity: 25 }
    ]
  },
  // Single product without sizes
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
    hasSizes: false,
    sizes: [],
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
    hasSizes: false,
    sizes: [],
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
    hasSizes: true,
    sizes: [
      {
        id: 'SIZE-5-1',
        name: 'Compact',
        price: 499.99,
        stock: 4,
        dimensions: { length: 120, width: 60, height: 75, unit: 'cm' },
        weight: 30.0
      },
      {
        id: 'SIZE-5-2',
        name: 'Standard',
        price: 549.99,
        stock: 6,
        dimensions: { length: 140, width: 70, height: 75, unit: 'cm' },
        weight: 35.0
      }
    ],
    rawMaterials: [
      { rawMaterialId: '1', quantity: 15 },
      { rawMaterialId: '9', quantity: 4 },
      { rawMaterialId: '4', quantity: 30 },
      { rawMaterialId: '8', quantity: 1 }
    ]
  },
  // Additional products
  {
    id: '6',
    name: 'Modern Coffee Table',
    price: 349.99,
    category: 'Tables',
    stock: 8,
    barcode: 'TC06X9',
    image: 'https://images.pexels.com/photos/2082090/pexels-photo-2082090.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Sleek modern coffee table with storage',
    dimensions: { length: 120, width: 60, height: 45, unit: 'cm' },
    weight: 25.0,
    material: 'Walnut & Metal',
    color: 'Dark Walnut',
    hasSizes: false,
    sizes: [],
    rawMaterials: [
      { rawMaterialId: '1', quantity: 10 },
      { rawMaterialId: '4', quantity: 20 },
      { rawMaterialId: '7', quantity: 1 },
      { rawMaterialId: '8', quantity: 0.5 }
    ]
  },
  {
    id: '7',
    name: 'Dining Chair Set',
    price: 249.99,
    category: 'Chairs',
    stock: 20,
    barcode: 'CD07Y1',
    image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Set of elegant dining chairs with comfortable padding',
    dimensions: { length: 45, width: 45, height: 90, unit: 'cm' },
    weight: 8.0,
    material: 'Oak Wood & Fabric',
    color: 'Beige',
    hasSizes: false,
    sizes: [],
    rawMaterials: [
      { rawMaterialId: '1', quantity: 5 },
      { rawMaterialId: '4', quantity: 15 },
      { rawMaterialId: '5', quantity: 1 },
      { rawMaterialId: '11', quantity: 2 }
    ]
  },
  {
    id: '8',
    name: 'Bookshelf',
    price: 299.99,
    category: 'Storage',
    stock: 7,
    barcode: 'SB08Z2',
    image: 'https://images.pexels.com/photos/696407/pexels-photo-696407.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Spacious bookshelf with adjustable shelves',
    dimensions: { length: 80, width: 30, height: 180, unit: 'cm' },
    weight: 40.0,
    material: 'Oak Wood',
    color: 'Natural Oak',
    hasSizes: true,
    sizes: [
      {
        id: 'SIZE-8-1',
        name: 'Small',
        price: 249.99,
        stock: 3,
        dimensions: { length: 60, width: 30, height: 150, unit: 'cm' },
        weight: 30.0
      },
      {
        id: 'SIZE-8-2',
        name: 'Medium',
        price: 299.99,
        stock: 2,
        dimensions: { length: 80, width: 30, height: 180, unit: 'cm' },
        weight: 40.0
      },
      {
        id: 'SIZE-8-3',
        name: 'Large',
        price: 349.99,
        stock: 2,
        dimensions: { length: 100, width: 30, height: 200, unit: 'cm' },
        weight: 50.0
      }
    ],
    rawMaterials: [
      { rawMaterialId: '1', quantity: 20 },
      { rawMaterialId: '4', quantity: 40 },
      { rawMaterialId: '7', quantity: 1.5 },
      { rawMaterialId: '8', quantity: 1 }
    ]
  },
  {
    id: '9',
    name: 'Leather Sofa',
    price: 1299.99,
    category: 'Sofas & Seating',
    stock: 4,
    barcode: 'FS09A3',
    image: 'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Luxurious leather sofa with premium comfort',
    dimensions: { length: 220, width: 90, height: 85, unit: 'cm' },
    weight: 85.0,
    material: 'Leather & Hardwood',
    color: 'Brown',
    hasSizes: true,
    sizes: [
      {
        id: 'SIZE-9-1',
        name: '2-Seater',
        price: 999.99,
        stock: 2,
        dimensions: { length: 180, width: 90, height: 85, unit: 'cm' },
        weight: 70.0
      },
      {
        id: 'SIZE-9-2',
        name: '3-Seater',
        price: 1299.99,
        stock: 1,
        dimensions: { length: 220, width: 90, height: 85, unit: 'cm' },
        weight: 85.0
      },
      {
        id: 'SIZE-9-3',
        name: 'Sectional',
        price: 1899.99,
        stock: 1,
        dimensions: { length: 280, width: 230, height: 85, unit: 'cm' },
        weight: 120.0
      }
    ],
    rawMaterials: [
      { rawMaterialId: '6', quantity: 15 },
      { rawMaterialId: '5', quantity: 8 },
      { rawMaterialId: '4', quantity: 60 },
      { rawMaterialId: '13', quantity: 10 }
    ]
  },
  {
    id: '10',
    name: 'Queen Bed Frame',
    price: 799.99,
    category: 'Bedroom',
    stock: 6,
    barcode: 'BQ10B4',
    image: 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Elegant queen-sized bed frame with headboard',
    dimensions: { length: 210, width: 160, height: 120, unit: 'cm' },
    weight: 65.0,
    material: 'Maple Wood',
    color: 'Walnut Finish',
    hasSizes: true,
    sizes: [
      {
        id: 'SIZE-10-1',
        name: 'Twin',
        price: 599.99,
        stock: 2,
        dimensions: { length: 190, width: 100, height: 120, unit: 'cm' },
        weight: 45.0
      },
      {
        id: 'SIZE-10-2',
        name: 'Full',
        price: 699.99,
        stock: 2,
        dimensions: { length: 190, width: 140, height: 120, unit: 'cm' },
        weight: 55.0
      },
      {
        id: 'SIZE-10-3',
        name: 'Queen',
        price: 799.99,
        stock: 1,
        dimensions: { length: 210, width: 160, height: 120, unit: 'cm' },
        weight: 65.0
      },
      {
        id: 'SIZE-10-4',
        name: 'King',
        price: 899.99,
        stock: 1,
        dimensions: { length: 210, width: 190, height: 120, unit: 'cm' },
        weight: 75.0
      }
    ],
    rawMaterials: [
      { rawMaterialId: '13', quantity: 30 },
      { rawMaterialId: '4', quantity: 80 },
      { rawMaterialId: '7', quantity: 2 },
      { rawMaterialId: '8', quantity: 1.5 }
    ]
  }
];

export const mockTransactions = [
  {
    id: 'TXN-001',
    items: [
      { 
        product: {
          id: '1',
          name: 'Executive Dining Table',
          price: 1099.99,
          barcode: 'TE01MZ',
          category: 'Tables'
        }, 
        quantity: 1,
        selectedSize: 'Large'
      },
      { 
        product: {
          id: '2',
          name: 'Executive Office Chair',
          price: 399.99,
          barcode: 'CE01Q2',
          category: 'Chairs'
        }, 
        quantity: 4,
        selectedSize: 'Standard'
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
  },
  {
    id: 'TXN-002',
    items: [
      { 
        product: {
          id: '3',
          name: 'Rustic Farmhouse Table',
          price: 649.99,
          barcode: 'TF03U6',
          category: 'Tables'
        }, 
        quantity: 1,
        selectedSize: null
      },
      { 
        product: {
          id: '7',
          name: 'Dining Chair Set',
          price: 249.99,
          barcode: 'CD07Y1',
          category: 'Chairs'
        }, 
        quantity: 6,
        selectedSize: null
      }
    ],
    subtotal: 2149.93,
    categoryTaxTotal: 32.50,
    fullBillTaxTotal: 171.99,
    totalTax: 204.49,
    discount: 0,
    total: 2354.42,
    paymentMethod: 'cash',
    timestamp: new Date('2024-01-18T14:45:00'),
    cashier: 'John Doe',
    salesperson: 'John Doe',
    customerName: 'Emily Johnson',
    customerPhone: '+1-555-4567',
    customerEmail: 'emily.j@email.com',
    customerAddress: '456 Oak St, City, State 12345',
    status: 'completed',
    notes: 'Customer will pick up next week'
  },
  {
    id: 'TXN-003',
    items: [
      { 
        product: {
          id: '9',
          name: 'Leather Sofa',
          price: 1299.99,
          barcode: 'FS09A3',
          category: 'Sofas & Seating'
        }, 
        quantity: 1,
        selectedSize: '3-Seater'
      },
      { 
        product: {
          id: '6',
          name: 'Modern Coffee Table',
          price: 349.99,
          barcode: 'TC06X9',
          category: 'Tables'
        }, 
        quantity: 1,
        selectedSize: null
      }
    ],
    subtotal: 1649.98,
    categoryTaxTotal: 17.50,
    fullBillTaxTotal: 131.99,
    totalTax: 149.49,
    discount: 164.99,
    total: 1634.48,
    paymentMethod: 'card',
    timestamp: new Date('2024-01-20T11:15:00'),
    cashier: 'Sarah Wilson',
    salesperson: 'Jane Smith',
    customerName: 'Michael Brown',
    customerPhone: '+1-555-7890',
    customerEmail: 'michael.b@email.com',
    customerAddress: '789 Pine St, City, State 12345',
    status: 'completed',
    notes: 'Applied 10% discount for returning customer'
  },
  {
    id: 'TXN-004',
    items: [
      { 
        product: {
          id: '10',
          name: 'Queen Bed Frame',
          price: 799.99,
          barcode: 'BQ10B4',
          category: 'Bedroom'
        }, 
        quantity: 1,
        selectedSize: 'Queen'
      }
    ],
    subtotal: 799.99,
    categoryTaxTotal: 0,
    fullBillTaxTotal: 64.00,
    totalTax: 64.00,
    discount: 0,
    total: 863.99,
    paymentMethod: 'digital',
    timestamp: new Date('2024-01-22T16:30:00'),
    cashier: 'John Doe',
    salesperson: 'Sarah Wilson',
    customerName: 'Jessica Lee',
    customerPhone: '+1-555-2345',
    customerEmail: 'jessica.l@email.com',
    customerAddress: '101 Maple St, City, State 12345',
    status: 'completed',
    notes: ''
  },
  {
    id: 'TXN-005',
    items: [
      { 
        product: {
          id: '8',
          name: 'Bookshelf',
          price: 299.99,
          barcode: 'SB08Z2',
          category: 'Storage'
        }, 
        quantity: 2,
        selectedSize: 'Medium'
      },
      { 
        product: {
          id: '4',
          name: 'Glass Side Table',
          price: 199.99,
          barcode: 'T404V7',
          category: 'Tables'
        }, 
        quantity: 1,
        selectedSize: null
      }
    ],
    subtotal: 799.97,
    categoryTaxTotal: 10.00,
    fullBillTaxTotal: 64.00,
    totalTax: 74.00,
    discount: 0,
    total: 873.97,
    paymentMethod: 'card',
    timestamp: new Date('2024-01-25T09:45:00'),
    cashier: 'Jane Smith',
    salesperson: 'Jane Smith',
    customerName: 'David Wilson',
    customerPhone: '+1-555-6789',
    customerEmail: 'david.w@email.com',
    customerAddress: '202 Elm St, City, State 12345',
    status: 'completed',
    notes: 'Customer requested assembly service'
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
  },
  {
    id: 'COUPON-005',
    code: 'SUMMER25',
    description: 'Summer sale discount',
    discountType: 'percentage',
    discountPercent: 25,
    discountAmount: 0,
    minimumAmount: 300,
    maxDiscount: 250,
    usageLimit: 200,
    usedCount: 45,
    validFrom: new Date('2024-06-01'),
    validTo: new Date('2024-08-31'),
    isActive: true,
    applicableCategories: [],
    createdAt: new Date('2024-05-15')
  },
  {
    id: 'COUPON-006',
    code: 'TABLES10',
    description: '10% off all tables',
    discountType: 'percentage',
    discountPercent: 10,
    discountAmount: 0,
    minimumAmount: 0,
    maxDiscount: null,
    usageLimit: null,
    usedCount: 12,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    isActive: true,
    applicableCategories: ['Tables'],
    createdAt: new Date('2024-01-01')
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
    applicableCategories: [],
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'TAX-005',
    name: 'Bedroom Furniture Tax',
    description: 'Special tax for bedroom furniture',
    rate: 4.0,
    taxType: 'category',
    isActive: true,
    applicableCategories: ['Bedroom'],
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'TAX-006',
    name: 'Storage Solutions Tax',
    description: 'Tax for storage furniture items',
    rate: 2.5,
    taxType: 'category',
    isActive: true,
    applicableCategories: ['Storage'],
    createdAt: new Date('2024-01-15')
  }
];