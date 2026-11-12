'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, CustomCakeOptions, Product, ProductVariation } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    variation?: ProductVariation,
    customCakeOptions?: CustomCakeOptions
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'deebakes_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load cart on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse cart items from storage', e);
    }
    setInitialized(true);
  }, []);

  // Save cart on changes
  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart items to storage', e);
    }
  }, [items, initialized]);

  const addToCart = (
    product: Product,
    quantity = 1,
    variation?: ProductVariation,
    customCakeOptions?: CustomCakeOptions
  ) => {
    const variationKey = variation ? `${variation.id}-${variation.option_name}` : 'default';
    const customKey = customCakeOptions
      ? `${customCakeOptions.cake_size}-${customCakeOptions.flavour}-${customCakeOptions.cake_message || ''}`
      : 'standard';
    const cartItemId = `${product.id}-${variationKey}-${customKey}`;

    const unitPrice = product.price + (variation ? variation.price_modifier : 0);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        // Update existing item quantity
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          total_price: newQty * unitPrice,
        };
        return updated;
      } else {
        // Add new item
        return [
          ...prevItems,
          {
            id: cartItemId,
            product,
            quantity,
            selected_variation: variation,
            custom_cake_options: customCakeOptions,
            unit_price: unitPrice,
            total_price: unitPrice * quantity,
          },
        ];
      }
    });

    // Auto-open cart drawer to provide clear visual feedback
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity,
            total_price: item.unit_price * quantity,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
