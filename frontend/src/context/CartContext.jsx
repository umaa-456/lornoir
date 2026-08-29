import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { productsApi } from '@/services/products';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { getSalePrice } from '@/utils/salePricing';

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
  const { settings } = useSiteSettings();
  const [items, setItems] = useState(readStorage);
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, variant, qty = 1) => {
    if (product.stockStatus && product.stockStatus !== 'in_stock') {
      toast.error(product.stockStatus === 'coming_soon' ? 'This product is coming soon' : 'This product is currently out of stock');
      return;
    }
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
          price: getSalePrice(product, variant?.price ?? product.price),
          variant: variant?.label || null,
          sku: variant?.sku || product.sku,
          qty,
          stock: variant?.stock ?? product.stock,
          stockStatus: product.stockStatus || 'in_stock',
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

  const revalidateCart = async () => {
    if (!items.length) return [];
    try {
      const products = await productsApi.getAvailability([...new Set(items.map((item) => item.productId))]);
      const productById = new Map(products.map((product) => [product._id, product]));
      const unavailable = [];
      setItems((current) => current.map((item) => {
        const product = productById.get(item.productId);
        const variant = product?.variants?.find((value) => value.sku === item.sku);
        const stockStatus = product?.stockStatus || 'out_of_stock';
        const stock = variant?.stock ?? 0;
        if (stockStatus !== 'in_stock' || stock < item.qty) unavailable.push(item.name);
        return { ...item, stockStatus, stock };
      }));
      return unavailable;
    } catch {
      // The order API remains authoritative if this convenience check fails.
      return [];
    }
  };

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

  const shipping = items.length === 0 || settings.shipping?.freeShipping ? 0 : Number(settings.shipping?.fixedCharge || 0);
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
    revalidateCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
