import { Product, RawMaterial, Transaction } from '../types';

export const mockRawMaterials: RawMaterial[] = [
  {
    id: '1',
    name: 'Oak Wood Planks',
    category: 'Wood',
    unit: 'sq ft',
    stockQuantity: 500,
    unitPrice: 12.50,
    supplier: 'Premium Wood Co.',
    minimumStock: 50,
    description: 'High-quality oak wood planks for furniture making'
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
    description: 'Sustainable pine wood boards'
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
    description: 'Heavy-duty steel hinges for cabinets and doors'
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
    description: 'Premium wood screws, various sizes'
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
    description: 'High-density foam for chair and sofa padding'
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
    description: 'Genuine leather fabric for premium furniture'
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
    description: 'Professional walnut wood stain'
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
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Executive Office Chair',
    price: 299.99,
    category: 'Office Furniture',
    stock: 15,
    barcode: '1234567890123',
    image: 'https://images.pexels.com/photos/586344/pexels-photo-586344.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Ergonomic executive chair with leather upholstery',
    dimensions: { length: 65, width: 65, height: 120, unit: 'cm' },
    weight: 18.5,
    material: 'Leather & Steel',
    color: 'Black',
    rawMaterials: [
      { rawMaterialId: '6', quantity: 3 }, // Leather Fabric
      { rawMaterialId: '5', quantity: 2 }, // Foam Padding
      { rawMaterialId: '3', quantity: 4 }  // Steel Hinges
    ]
  },
  {
    id: '2',
    name: 'Dining Table Set',
    price: 899.99,
    category: 'Dining Room',
    stock: 8,
    barcode: '2345678901234',
    image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '6-seater oak dining table with matching chairs',
    dimensions: { length: 180, width: 90, height: 75, unit: 'cm' },
    weight: 45.0,
    material: 'Oak Wood',
    color: 'Natural Oak',
    rawMaterials: [
      { rawMaterialId: '1', quantity: 25 }, // Oak Wood Planks
      { rawMaterialId: '4', quantity: 50 }, // Wood Screws
      { rawMaterialId: '7', quantity: 2 },  // Wood Stain
      { rawMaterialId: '8', quantity: 1 }   // Polyurethane Finish
    ]
  },
  {
    id: '3',
    name: 'Modern Bookshelf',
    price: 249.99,
    category: 'Storage',
    stock: 12,
    barcode: '3456789012345',
    image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '5-tier modern bookshelf with clean lines',
    dimensions: { length: 80, width: 30, height: 180, unit: 'cm' },
    weight: 25.0,
    material: 'Pine Wood',
    color: 'White',
    rawMaterials: [
      { rawMaterialId: '2', quantity: 15 }, // Pine Wood Boards
      { rawMaterialId: '4', quantity: 30 }, // Wood Screws
      { rawMaterialId: '8', quantity: 1 }   // Polyurethane Finish
    ]
  },
  {
    id: '4',
    name: 'Leather Sofa 3-Seater',
    price: 1299.99,
    category: 'Living Room',
    stock: 5,
    barcode: '4567890123456',
    image: 'https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Premium leather 3-seater sofa with steel frame',
    dimensions: { length: 200, width: 90, height: 85, unit: 'cm' },
    weight: 55.0,
    material: 'Leather & Steel Frame',
    color: 'Brown',
    rawMaterials: [
      { rawMaterialId: '6', quantity: 12 }, // Leather Fabric
      { rawMaterialId: '5', quantity: 8 },  // Foam Padding
      { rawMaterialId: '4', quantity: 25 }  // Wood Screws
    ]
  },
  {
    id: '5',
    name: 'Coffee Table',
    price: 199.99,
    category: 'Living Room',
    stock: 20,
    barcode: '5678901234567',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Rustic oak coffee table with storage drawer',
    dimensions: { length: 120, width: 60, height: 45, unit: 'cm' },
    weight: 22.0,
    material: 'Oak Wood',
    color: 'Walnut Stain',
    rawMaterials: [
      { rawMaterialId: '1', quantity: 8 },  // Oak Wood Planks
      { rawMaterialId: '3', quantity: 2 },  // Steel Hinges
      { rawMaterialId: '4', quantity: 20 }, // Wood Screws
      { rawMaterialId: '7', quantity: 1 }   // Wood Stain
    ]
  },
  {
    id: '6',
    name: 'Wardrobe Cabinet',
    price: 699.99,
    category: 'Bedroom',
    stock: 6,
    barcode: '6789012345678',
    image: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '3-door wardrobe with hanging space and shelves',
    dimensions: { length: 150, width: 60, height: 200, unit: 'cm' },
    weight: 65.0,
    material: 'Pine Wood',
    color: 'White',
    rawMaterials: [
      { rawMaterialId: '2', quantity: 30 }, // Pine Wood Boards
      { rawMaterialId: '3', quantity: 6 },  // Steel Hinges
      { rawMaterialId: '4', quantity: 60 }, // Wood Screws
      { rawMaterialId: '8', quantity: 2 }   // Polyurethane Finish
    ]
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    items: [
      { product: mockProducts[0], quantity: 1 },
      { product: mockProducts[4], quantity: 1 }
    ],
    subtotal: 499.98,
    tax: 40.00,
    discount: 0,
    total: 539.98,
    paymentMethod: 'card',
    timestamp: new Date('2024-01-15T10:30:00'),
    cashier: 'Sarah Wilson',
    customerName: 'John Smith',
    customerPhone: '+1-555-0123'
  }
];