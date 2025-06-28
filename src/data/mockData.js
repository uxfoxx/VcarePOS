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

export const mockProducts = [
  // Tables
  {
    id: '1',
    name: 'Executive Dining Table',
    price: 899.99,
    category: 'Tables',
    stock: 8,
    barcode: '1234567890123',
    image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '8-seater oak dining table with elegant design',
    dimensions: { length: 200, width: 100, height: 75, unit: 'cm' },
    weight: 55.0,
    material: 'Oak Wood',
    color: 'Natural Oak',
    rawMaterials: [
      { rawMaterialId: '1', quantity: 30 }, // Oak Wood Planks
      { rawMaterialId: '4', quantity: 60 }, // Wood Screws
      { rawMaterialId: '7', quantity: 2 },  // Wood Stain
      { rawMaterialId: '8', quantity: 1 }   // Polyurethane Finish
    ]
  },
  {
    id: '2',
    name: 'Modern Coffee Table',
    price: 299.99,
    category: 'Tables',
    stock: 15,
    barcode: '2345678901234',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Contemporary glass-top coffee table with metal legs',
    dimensions: { length: 120, width: 60, height: 45, unit: 'cm' },
    weight: 25.0,
    material: 'Glass & Metal',
    color: 'Clear Glass',
    rawMaterials: [
      { rawMaterialId: '9', quantity: 4 },  // Table Legs - Metal
      { rawMaterialId: '4', quantity: 20 }, // Wood Screws
      { rawMaterialId: '8', quantity: 1 }   // Polyurethane Finish
    ]
  },
  {
    id: '3',
    name: 'Rustic Farmhouse Table',
    price: 649.99,
    category: 'Tables',
    stock: 6,
    barcode: '3456789012345',
    image: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Handcrafted pine farmhouse dining table',
    dimensions: { length: 180, width: 90, height: 75, unit: 'cm' },
    weight: 45.0,
    material: 'Pine Wood',
    color: 'Natural Pine',
    rawMaterials: [
      { rawMaterialId: '2', quantity: 25 }, // Pine Wood Boards
      { rawMaterialId: '4', quantity: 50 }, // Wood Screws
      { rawMaterialId: '7', quantity: 2 },  // Wood Stain
      { rawMaterialId: '8', quantity: 1 }   // Polyurethane Finish
    ]
  },
  {
    id: '4',
    name: 'Glass Side Table',
    price: 199.99,
    category: 'Tables',
    stock: 12,
    barcode: '4567890123456',
    image: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Elegant glass side table with chrome legs',
    dimensions: { length: 50, width: 50, height: 55, unit: 'cm' },
    weight: 12.0,
    material: 'Glass & Chrome',
    color: 'Clear',
    rawMaterials: [
      { rawMaterialId: '9', quantity: 4 },  // Table Legs - Metal
      { rawMaterialId: '4', quantity: 10 }  // Wood Screws
    ]
  },
  {
    id: '5',
    name: 'Standing Desk',
    price: 549.99,
    category: 'Tables',
    stock: 10,
    barcode: '5678901234567',
    image: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Adjustable height standing desk for office',
    dimensions: { length: 140, width: 70, height: 75, unit: 'cm' },
    weight: 35.0,
    material: 'Oak Wood & Metal',
    color: 'Oak Finish',
    rawMaterials: [
      { rawMaterialId: '1', quantity: 15 }, // Oak Wood Planks
      { rawMaterialId: '9', quantity: 4 },  // Table Legs - Metal
      { rawMaterialId: '4', quantity: 30 }, // Wood Screws
      { rawMaterialId: '8', quantity: 1 }   // Polyurethane Finish
    ]
  },

  // Chairs
  {
    id: '6',
    name: 'Executive Office Chair',
    price: 399.99,
    category: 'Chairs',
    stock: 20,
    barcode: '6789012345678',
    image: 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Ergonomic executive chair with leather upholstery',
    dimensions: { length: 65, width: 65, height: 120, unit: 'cm' },
    weight: 18.5,
    material: 'Leather & Steel',
    color: 'Black',
    rawMaterials: [
      { rawMaterialId: '6', quantity: 3 },  // Leather Fabric
      { rawMaterialId: '5', quantity: 2 },  // Foam Padding
      { rawMaterialId: '10', quantity: 5 }, // Chair Casters
      { rawMaterialId: '4', quantity: 25 }  // Wood Screws
    ]
  },
  {
    id: '7',
    name: 'Dining Chair Set',
    price: 159.99,
    category: 'Chairs',
    stock: 24,
    barcode: '7890123456789',
    image: 'https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Set of 2 upholstered dining chairs',
    dimensions: { length: 45, width: 50, height: 85, unit: 'cm' },
    weight: 8.0,
    material: 'Fabric & Wood',
    color: 'Gray',
    rawMaterials: [
      { rawMaterialId: '2', quantity: 8 },  // Pine Wood Boards
      { rawMaterialId: '5', quantity: 2 },  // Foam Padding
      { rawMaterialId: '4', quantity: 20 }, // Wood Screws
      { rawMaterialId: '8', quantity: 1 }   // Polyurethane Finish
    ]
  },
  {
    id: '8',
    name: 'Accent Armchair',
    price: 449.99,
    category: 'Chairs',
    stock: 8,
    barcode: '8901234567890',
    image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Comfortable accent chair with wooden frame',
    dimensions: { length: 70, width: 75, height: 90, unit: 'cm' },
    weight: 15.0,
    material: 'Fabric & Oak',
    color: 'Beige',
    rawMaterials: [
      { rawMaterialId: '1', quantity: 10 }, // Oak Wood Planks
      { rawMaterialId: '5', quantity: 4 },  // Foam Padding
      { rawMaterialId: '4', quantity: 30 }, // Wood Screws
      { rawMaterialId: '7', quantity: 1 }   // Wood Stain
    ]
  },
  {
    id: '9',
    name: 'Bar Stool',
    price: 89.99,
    category: 'Chairs',
    stock: 16,
    barcode: '9012345678901',
    image: 'https://images.pexels.com/photos/4050302/pexels-photo-4050302.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Modern bar stool with adjustable height',
    dimensions: { length: 40, width: 40, height: 110, unit: 'cm' },
    weight: 6.5,
    material: 'Metal & Vinyl',
    color: 'Black',
    rawMaterials: [
      { rawMaterialId: '9', quantity: 1 },  // Table Legs - Metal
      { rawMaterialId: '5', quantity: 1 },  // Foam Padding
      { rawMaterialId: '4', quantity: 10 }  // Wood Screws
    ]
  },
  {
    id: '10',
    name: 'Recliner Chair',
    price: 699.99,
    category: 'Chairs',
    stock: 5,
    barcode: '0123456789012',
    image: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Luxury leather recliner with massage function',
    dimensions: { length: 85, width: 90, height: 105, unit: 'cm' },
    weight: 35.0,
    material: 'Premium Leather',
    color: 'Brown',
    rawMaterials: [
      { rawMaterialId: '6', quantity: 8 },  // Leather Fabric
      { rawMaterialId: '5', quantity: 6 },  // Foam Padding
      { rawMaterialId: '3', quantity: 8 },  // Steel Hinges
      { rawMaterialId: '4', quantity: 40 }  // Wood Screws
    ]
  }
];

export const mockTransactions = [
  {
    id: 'TXN-001',
    items: [
      { product: mockProducts[0], quantity: 1 }, // Executive Dining Table
      { product: mockProducts[6], quantity: 4 }  // Dining Chair Set (2 sets = 8 chairs)
    ],
    subtotal: 1539.95,
    tax: 123.20,
    discount: 0,
    total: 1663.15,
    paymentMethod: 'card',
    timestamp: new Date('2024-01-15T10:30:00'),
    cashier: 'Sarah Wilson',
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
      { product: mockProducts[5], quantity: 1 }, // Executive Office Chair
      { product: mockProducts[4], quantity: 1 }  // Standing Desk
    ],
    subtotal: 949.98,
    tax: 76.00,
    discount: 50.00,
    total: 975.98,
    paymentMethod: 'cash',
    timestamp: new Date('2024-01-15T14:20:00'),
    cashier: 'Sarah Wilson',
    customerName: 'Jane Doe',
    customerPhone: '+1-555-0456',
    customerEmail: 'jane.doe@email.com',
    status: 'processing',
    appliedCoupon: 'WELCOME10',
    notes: 'Assembly required - customer will pick up'
  },
  {
    id: 'TXN-003',
    items: [
      { product: mockProducts[1], quantity: 1 }, // Modern Coffee Table
      { product: mockProducts[8], quantity: 2 }  // Bar Stool
    ],
    subtotal: 479.97,
    tax: 38.40,
    discount: 0,
    total: 518.37,
    paymentMethod: 'digital',
    timestamp: new Date('2024-01-16T09:15:00'),
    cashier: 'Sarah Wilson',
    customerName: 'Mike Johnson',
    customerPhone: '+1-555-0789',
    status: 'pending',
    notes: 'Customer will confirm delivery address later'
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
    usedCount: 16, // Updated to reflect usage
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