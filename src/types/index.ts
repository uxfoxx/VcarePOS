export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  barcode?: string;
  image?: string;
  description?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'inch';
  };
  weight?: number;
  material?: string;
  color?: string;
  rawMaterials?: RawMaterialUsage[];
}

export interface RawMaterial {
  id: string;
  name: string;
  category: string;
  unit: string; // kg, meters, pieces, etc.
  stockQuantity: number;
  unitPrice: number;
  supplier?: string;
  minimumStock: number;
  description?: string;
}

export interface RawMaterialUsage {
  rawMaterialId: string;
  quantity: number;
  rawMaterial?: RawMaterial;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount?: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  timestamp: Date;
  cashier: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'cashier' | 'manager';
  email: string;
}