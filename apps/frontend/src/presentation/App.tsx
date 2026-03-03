import React from 'react';
import { AppRouter } from './AppRouter';

/**
 * Componente raiz de presentacion.
 * Delega el renderizado al enrutador principal.
 */
export const App: React.FC = () => {
    return <AppRouter />;
};