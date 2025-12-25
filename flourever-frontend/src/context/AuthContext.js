import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [orderTrigger, setOrderTrigger] = useState(0);
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  // Function to update user in state
  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Cart functions
  const addToCart = (product, quantity = 1, size = 'Regular') => {
    const basePrice = parseFloat(product.price);
    const itemPrice = (size === 'Large') ? (basePrice * 1.5) : basePrice;

    setCart(prevCart => {
      const existingItem = prevCart.find(
        item => item.id === product.id && item.size === size
      );

      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity, isSelected: true } 
            : item
        );
      } else {
        const newItem = {
          ...product,
          basePrice: basePrice, 
          price: itemPrice,     
          quantity,
          size,
          cartItemId: `${product.id}-${size}`, 
          stableId: Date.now(), 
          isSelected: true 
        };
        return [...prevCart, newItem];
      }
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
  };
  
  const updateCartQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      return removeFromCart(cartItemId);
    }
    setCart(prevCart => 
      prevCart.map(item => 
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  const clearFullCart = () => {
    setCart([]);
  };

  const clearSelectedFromCart = () => {
    setCart(prevCart => prevCart.filter(item => !item.isSelected));
  };

  const toggleCartItemSelection = (cartItemId) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.cartItemId === cartItemId ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const toggleSelectAll = () => {
    const allSelected = cart.every(item => item.isSelected);
    setCart(prevCart => 
      prevCart.map(item => ({ ...item, isSelected: !allSelected }))
    );
  };

  const updateCartItemSize = (cartItemId, newSize) => {
    setCart(prevCart => {
      const itemToUpdate = prevCart.find(item => item.cartItemId === cartItemId);
      if (!itemToUpdate) return prevCart;
      if (itemToUpdate.size === newSize) {
        return prevCart;
      }
      const newPrice = (newSize === 'Large') ? (itemToUpdate.basePrice * 1.5) : itemToUpdate.basePrice;
      const newCartItemId = `${itemToUpdate.id}-${newSize}`;
      const existingItemWithNewSize = prevCart.find(item => item.cartItemId === newCartItemId);

      if (existingItemWithNewSize) {
        const cartWithoutOldItem = prevCart.filter(item => item.cartItemId !== cartItemId);
        return cartWithoutOldItem.map(item =>
          item.cartItemId === newCartItemId
            ? { ...item, quantity: item.quantity + itemToUpdate.quantity, isSelected: true }
            : item
        );
      } else {
        return prevCart.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, size: newSize, price: newPrice, cartItemId: newCartItemId, isSelected: true } 
            : item
        );
      }
    });
  };

  const triggerOrderRefresh = () => {
    setOrderTrigger(prev => prev + 1);
  };

  // Auth functions
  const signup = async (formData) => {
    await api.post('/signup', formData);
    return true;
  };

  const verifyOtp = async (email, code, shouldRedirect = true) => {
    const res = await api.post('/verify', { email, code });
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      if (shouldRedirect) navigate('/store');
      return true;
    }
    return false;
  };

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return true; 
    }
    return false;
  };

  // Logout with animation
  const logout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      clearFullCart();
      navigate('/');
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 500);
    }, 1500);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      signup, 
      verifyOtp, 
      login, 
      logout, 
      loading,
      cart, 
      addToCart, 
      removeFromCart, 
      updateCartQuantity, 
      clearFullCart, 
      clearSelectedFromCart, 
      toggleCartItemSelection, 
      toggleSelectAll, 
      updateCartItemSize,
      orderTrigger,
      triggerOrderRefresh,
      isLoggingOut,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};