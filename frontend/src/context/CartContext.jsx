import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);
const STORAGE_KEY = 'lornoir_cart';

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStorage);
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, variant, qty = 1) => {
    setItems((prev) => {
      const lineId = `${product._id}-${variant?.sku || 'default'}`;
      const existing = prev.find((i) => i.lineId === lineId);
      if (existing) {
        return prev.map((i) =>
          i.lineId === lineId ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          lineId,
          productId: product._id,
          name: product.name,
          image: product.images?.[0]?.url || product.image,
          price: variant?.price ?? product.price,
          variant: variant?.label || null,
          sku: variant?.sku || product.sku,
          qty,
          stock: variant?.stock ?? product.stock,
        },
      ];
    });
    toast.success(`${product.name} added to bag`);
  };

  const removeFromCart = (lineId) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  };

  const updateQty = (lineId, qty) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.lineId === lineId ? { ...i, qty: Math.min(qty, i.stock ?? 99) } : i))
    );
  };

  const clearCart = () => setItems([]);

  const applyCoupon = (couponData) => {
    setCoupon(couponData);
    toast.success(`Coupon "${couponData.code}" applied`);
  };

  const removeCoupon = () => setCoupon(null);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );

  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.type === 'percent') return subtotal * (coupon.value / 100);
    return Math.min(coupon.value, subtotal);
  }, [coupon, subtotal]);

  const shipping = subtotal - discount > 150 || items.length === 0 ? 0 : 12;
  const tax = Math.max(0, (subtotal - discount) * 0.0);
  const total = Math.max(0, subtotal - discount + shipping + tax);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  const value = {
    items,
    itemCount,
    coupon,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
