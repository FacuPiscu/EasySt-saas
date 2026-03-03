import React from 'react';
import styles from './PointOfSalePage.module.css';

export const PointOfSalePage: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.productCatalog}>
                <header className={styles.header}>
                    <h2>Products</h2>
                    <input
                        type="text"
                        placeholder="Scan barcode or search name..."
                        className={styles.searchBar}
                    />
                </header>
                <div className={styles.grid}>
                    <p className={styles.placeholderText}>
                        // Placeholder: Grilla de Categorías y Productos a Vender
                    </p>
                </div>
            </div>
            <aside className={styles.cartSidebar}>
                <div className={styles.cartHeader}>
                    <h2>Current Sale</h2>
                </div>
                <div className={styles.cartItems}>
                    <p className={styles.cartPlaceholder}>
                        // Placeholder: Items añadidos al carrito
                    </p>
                </div>
                <div className={styles.cartFooter}>
                    <div className={styles.totalRow}>
                        <span>Total:</span>
                        <span className={styles.totalAmount}>$ 0.00</span>
                    </div>
                    <button className={styles.checkoutButton}>Checkout</button>
                    <button className={styles.discardButton}>Discard</button>
                </div>
            </aside>
        </div>
    );
};
