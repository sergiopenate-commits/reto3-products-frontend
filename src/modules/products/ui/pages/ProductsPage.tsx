import React, { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
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

const SKELETON_COLS = 6;
const SKELETON_ROWS = 5;

const ProductsPage: React.FC = () => {
  const { data: products = [], isLoading } = useProducts();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();

  const [globalFilter, setGlobalFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const stats = useMemo(() => ({
    total: products.length,
    totalStock: products.reduce((sum, p) => sum + Number(p.stock), 0),
    avgPrice: products.length
      ? products.reduce((sum, p) => sum + Number(p.price), 0) / products.length
      : 0,
  }), [products]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: info => <span className={styles.cellId}>#{info.getValue()}</span>,
      }),
      columnHelper.accessor('name', {
        header: 'Nombre',
        cell: info => <span className={styles.cellName}>{info.getValue()}</span>,
      }),
      columnHelper.accessor('description', {
        header: 'Descripción',
        cell: info => (
          <span className={styles.cellDesc}>{info.getValue() || '—'}</span>
        ),
      }),
      columnHelper.accessor('category', {
        header: 'Categoría',
        cell: info => <span className={styles.categoryBadge}>{info.getValue()}</span>,
      }),
      columnHelper.accessor('price', {
        header: 'Precio',
        cell: info => (
          <span className={styles.cellPrice}>${Number(info.getValue()).toFixed(2)}</span>
        ),
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: info => {
          const val = Number(info.getValue());
          const variant =
            val <= 30 ? styles.stockLow : val <= 80 ? styles.stockMid : styles.stockHigh;
          return <span className={`${styles.stockBadge} ${variant}`}>{val}</span>;
        },
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
        showToast('Error al guardar en el servidor', 'error');
      },
    });
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const visibleRows = table.getRowModel().rows;

  return (
    <div className={styles.page}>
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Productos</h1>
          <p className={styles.subtitle}>Dashboard de inventario en tiempo real</p>
        </div>
        <button className={styles.newBtn} onClick={() => setIsModalOpen(true)}>
          <span className={styles.newBtnPlus}>+</span>
          Nuevo producto
        </button>
      </header>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <InventoryOutlinedIcon fontSize="small" />
          </div>
          <div className={styles.statBody}>
            <p className={styles.statLabel}>Total productos</p>
            {isLoading
              ? <span className={styles.skeleton} style={{ width: 48, height: 28 }} />
              : <p className={styles.statValue}>{stats.total}</p>
            }
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <LayersOutlinedIcon fontSize="small" />
          </div>
          <div className={styles.statBody}>
            <p className={styles.statLabel}>Stock total</p>
            {isLoading
              ? <span className={styles.skeleton} style={{ width: 64, height: 28 }} />
              : <p className={styles.statValue}>{stats.totalStock.toLocaleString()}</p>
            }
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MonetizationOnOutlinedIcon fontSize="small" />
          </div>
          <div className={styles.statBody}>
            <p className={styles.statLabel}>Precio promedio</p>
            {isLoading
              ? <span className={styles.skeleton} style={{ width: 80, height: 28 }} />
              : <p className={styles.statValue}>${stats.avgPrice.toFixed(2)}</p>
            }
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Buscar por nombre, categoría..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
          />
          {globalFilter && (
            <button className={styles.clearBtn} onClick={() => setGlobalFilter('')}>
              ✕
            </button>
          )}
        </div>
        {globalFilter && (
          <p className={styles.filterInfo}>
            {visibleRows.length} resultado{visibleRows.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => (
                  <th key={header.id} className={styles.th}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <tr key={i} className={styles.tr}>
                    {Array.from({ length: SKELETON_COLS }).map((_, j) => (
                      <td key={j} className={styles.td}>
                        <span className={styles.skeleton} style={{ width: `${50 + (j * 17 + i * 11) % 40}%`, height: 14 }} />
                      </td>
                    ))}
                  </tr>
                ))
              : visibleRows.length === 0
              ? (
                <tr>
                  <td colSpan={SKELETON_COLS} className={styles.emptyCell}>
                    {globalFilter
                      ? `Sin resultados para "${globalFilter}"`
                      : 'No hay productos registrados'}
                  </td>
                </tr>
              )
              : visibleRows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={styles.tr}
                    style={{ animationDelay: `${i * 35}ms` }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className={styles.td}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      <BiaModal
        open={isModalOpen}
        onClose={handleClose}
        title="Nuevo producto"
        width="520px"
        className="products-dark-modal"
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
