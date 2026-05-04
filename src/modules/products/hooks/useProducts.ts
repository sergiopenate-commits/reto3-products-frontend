import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProduct,
  fetchProducts,
  MOCK_PRODUCTS,
} from '../services/productsService';
import { CreateProductPayload } from '../types/product.types';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        return await fetchProducts();
      } catch {
        return MOCK_PRODUCTS;
      }
    },
    staleTime: 30_000,
    retry: false,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
