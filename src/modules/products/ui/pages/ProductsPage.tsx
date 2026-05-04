import React, { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { BiaButton, BiaModal, BiaTextField } from '@components/index';
import { useCreateProduct, useProducts } from '../../hooks/useProducts';
import {
  CreateProductPayload,
  Product,
  ProductFormErrors,
  ProductFormState,
} from '../../types/product.types';
import styles from './ProductsPage.module.scss';

const columnHelper = createColumnHelper<Product>();

const EMPTY_FORM: ProductFormState = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
};

const ProductsPage: React.FC = () => {
  const { data: products = [], isLoading } = useProducts();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();

  const [globalFilter, setGlobalFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        size: 60,
        cell: info => <span className={styles.cellMuted}>#{info.getValue()}</span>,
      }),
      columnHelper.accessor('name', {
        header: 'Nombre',
        cell: info => <span className={styles.cellStrong}>{info.getValue()}</span>,
      }),
      columnHelper.accessor('description', {
        header: 'Descripción',
        cell: info => (
          <span className={styles.cellDescription}>{info.getValue() || '—'}</span>
        ),
      }),
      columnHelper.accessor('category', {
        header: 'Categoría',
        cell: info => <span className={styles.categoryBadge}>{info.getValue()}</span>,
      }),
      columnHelper.accessor('price', {
        header: 'Precio',
        cell: info => (
          <span className={styles.cellStrong}>
            ${Number(info.getValue()).toFixed(2)}
          </span>
        ),
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: info => {
          const val = Number(info.getValue());
          const variant =
            val <= 30 ? styles.stockLow : val <= 80 ? styles.stockMedium : styles.stockHigh;
          return <span className={`${styles.stockBadge} ${variant}`}>{val}</span>;
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Creado',
        cell: info => <span className={styles.cellMuted}>{info.getValue() || '—'}</span>,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: products,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleChange = (field: keyof ProductFormState) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: ProductFormErrors = {};
    if (!form.name.trim()) next.name = 'El nombre es requerido';
    if (!form.category.trim()) next.category = 'La categoría es requerida';
    const price = parseFloat(form.price);
    if (!form.price || isNaN(price) || price <= 0) next.price = 'Ingresa un precio mayor a 0';
    const stock = parseInt(form.stock, 10);
    if (form.stock !== '' && (isNaN(stock) || stock < 0)) next.stock = 'Stock no puede ser negativo';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = (): CreateProductPayload => ({
    name: form.name.trim(),
    description: form.description.trim(),
    price: parseFloat(form.price),
    stock: form.stock === '' ? 0 : parseInt(form.stock, 10),
    category: form.category.trim(),
  });

  const handleSubmit = () => {
    if (!validate()) return;
    createProduct(buildPayload(), {
      onSuccess: () => {
        handleClose();
        showToast('Producto creado exitosamente', 'success');
      },
      onError: () => {
        handleClose();
        showToast('No se pudo guardar en el servidor, pero el formulario fue enviado', 'error');
      },
    });
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const rowCount = table.getRowModel().rows.length;

  return (
    <div className={styles.page}>
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Productos</h1>
            <p className={styles.subtitle}>
              {isLoading
                ? 'Cargando...'
                : `${products.length} producto${products.length !== 1 ? 's' : ''} registrado${products.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <BiaButton onClick={() => setIsModalOpen(true)}>
            + Nuevo producto
          </BiaButton>
        </div>

        {/* Search */}
        <div className={styles.toolbar}>
          <BiaTextField
            placeholder="Buscar por nombre, categoría, descripción..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            showClearIcon
            onClear={() => setGlobalFilter('')}
            className={styles.searchField}
          />
          {globalFilter && (
            <p className={styles.filterInfo}>
              {rowCount} resultado{rowCount !== 1 ? 's' : ''} para "{globalFilter}"
            </p>
          )}
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          {isLoading ? (
            <div className={styles.stateBox}>Cargando productos...</div>
          ) : rowCount === 0 ? (
            <div className={styles.stateBox}>
              {globalFilter
                ? `Sin resultados para "${globalFilter}"`
                : 'No hay productos registrados'}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id} className={styles.thead}>
                    {hg.headers.map(header => (
                      <th key={header.id} className={styles.th}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={styles.tr}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className={styles.td}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create modal */}
      <BiaModal
        open={isModalOpen}
        onClose={handleClose}
        title="Nuevo producto"
        width="520px"
        footerActions={[
          <BiaButton key="cancel" variant="outlined" onClick={handleClose} disabled={isCreating}>
            Cancelar
          </BiaButton>,
          <BiaButton
            key="save"
            onClick={handleSubmit}
            isLoading={isCreating}
            loadingText="Guardando..."
          >
            Guardar producto
          </BiaButton>,
        ]}
      >
        <div className={styles.formGrid}>
          <BiaTextField
            label="Nombre del producto"
            required
            value={form.name}
            onChange={handleChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            autoFocus
          />
          <BiaTextField
            label="Descripción"
            value={form.description}
            onChange={handleChange('description')}
            fullWidth
          />
          <BiaTextField
            label="Categoría"
            required
            value={form.category}
            onChange={handleChange('category')}
            error={!!errors.category}
            helperText={errors.category}
            fullWidth
          />
          <div className={styles.formRow}>
            <BiaTextField
              label="Precio ($)"
              required
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              value={form.price}
              onChange={handleChange('price')}
              error={!!errors.price}
              helperText={errors.price}
              fullWidth
            />
            <BiaTextField
              label="Stock"
              type="number"
              inputProps={{ min: 0, step: '1' }}
              value={form.stock}
              onChange={handleChange('stock')}
              error={!!errors.stock}
              helperText={errors.stock}
              fullWidth
            />
          </div>
        </div>
      </BiaModal>
    </div>
  );
};

export default ProductsPage;
