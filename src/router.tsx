import { BiaLoading } from '@components/bia-loading/Loading';
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';


// Lazy loading del módulo Products
const ProductsModule = {
  Products: lazy(() =>
    import('./modules/products')
      .then(module => {
        if (!module.ProductsPage) {
          throw new Error('ProductsPage not found in module');
        }
        return { default: module.ProductsPage };
      })
  ),
};

export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  exact?: boolean;
  name: string;
  description: string;
  children?: RouteConfig[];
}

/**
 * Configuración de rutas de la aplicación
 * 
 * Este archivo centraliza todas las rutas de la aplicación.
 * Para agregar una nueva ruta:
 * 1. Importa el componente de la página usando lazy loading
 * 2. Agrega una nueva entrada en el array routes
 * 3. Crea el componente de la página si no existe
 */
export const routes: RouteConfig[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<BiaLoading message="Cargando módulo de Productos..." />}>
        <ProductsModule.Products />
      </Suspense>
    ),
    name: 'Products Page',
    description: 'Dashboard de Productos'
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
    name: 'CatchAll',
    description: 'Redirige rutas no encontradas a la página principal'
  }
];

/**
 * Componente Router principal
 * 
 * Renderiza todas las rutas configuradas en la aplicación.
 * Implementa lazy loading para mejorar el rendimiento:
 * - Los módulos se cargan solo cuando se necesitan
 * - Reduce el tamaño del bundle inicial
 * - Mejora el tiempo de carga inicial
 */
const AppRouter: React.FC = () => {
  const renderRoutes = (routeConfigs: RouteConfig[]) => {
    return routeConfigs.map((route) => (
      <Route
        key={route.path}
        path={route.path}
        element={route.element}
      >
        {route.children && renderRoutes(route.children)}
      </Route>
    ));
  };

  return (
    <Routes>
      {renderRoutes(routes)}
    </Routes>
  );
};

/**
 * Hook personalizado para obtener información de rutas
 * Útil para generar menús de navegación dinámicos
 */
export const useRoutes = (): RouteConfig[] => {
  return routes.filter(route => route.path !== '*' && route.path !== '/');
};

/**
 * Función helper para obtener una ruta por nombre
 */
export const getRouteByName = (name: string): string => {
  return routes.find(route => route.name === name)?.path || '/';
};

export default AppRouter;

