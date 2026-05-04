import { CreateProductPayload, Product } from '../types/product.types';

const BASE_URL = 'http://localhost:3000/api/products';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Laptop Pro 15"',
    description: 'Laptop de alto rendimiento para profesionales',
    price: 1299.99,
    stock: 45,
    category: 'Electrónica',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Auriculares Bluetooth',
    description: 'Cancelación de ruido activa con 30h de batería',
    price: 149.99,
    stock: 120,
    category: 'Electrónica',
    createdAt: '2024-02-01',
  },
  {
    id: 3,
    name: 'Teclado Mecánico',
    description: 'Switches Cherry MX Blue retroiluminado RGB',
    price: 89.99,
    stock: 75,
    category: 'Periféricos',
    createdAt: '2024-02-10',
  },
  {
    id: 4,
    name: 'Monitor 4K 27"',
    description: 'Panel IPS 27" con 144Hz y HDR400',
    price: 499.99,
    stock: 28,
    category: 'Electrónica',
    createdAt: '2024-03-05',
  },
  {
    id: 5,
    name: 'Ratón Ergonómico',
    description: 'Diseño vertical ergonómico inalámbrico',
    price: 59.99,
    stock: 200,
    category: 'Periféricos',
    createdAt: '2024-03-12',
  },
  {
    id: 6,
    name: 'Webcam Full HD',
    description: 'Resolución 1080p con micrófono integrado',
    price: 79.99,
    stock: 90,
    category: 'Periféricos',
    createdAt: '2024-04-01',
  },
  {
    id: 7,
    name: 'SSD NVMe 1TB',
    description: 'M.2 PCIe 4.0 con velocidad 7000MB/s',
    price: 119.99,
    stock: 150,
    category: 'Almacenamiento',
    createdAt: '2024-04-10',
  },
];

export const fetchProducts = async (): Promise<Product[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(BASE_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};
