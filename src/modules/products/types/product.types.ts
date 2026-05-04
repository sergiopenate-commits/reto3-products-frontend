export interface Product {
  id: number | string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt?: string;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export interface ProductFormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
}

export type ProductFormErrors = Partial<Record<keyof ProductFormState, string>>;
