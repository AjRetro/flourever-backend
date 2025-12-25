import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, TrashIcon, PlusIcon, MinusIcon, ShoppingBagIcon, 
  CheckIcon, ChevronDownIcon, ArrowLeftIcon, BanknotesIcon, 
  MapPinIcon, PhoneIcon, PaperAirplaneIcon 
} from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

// --- MAP IMPORTS ---
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- FIX FOR LEAFLET MARKER ICONS ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- INTERNAL COMPONENT: MAP CONTROLLER ---
function MapController({ center, onMoveEnd }) {
  const map = useMap();
  
  useEffect(() => {
    // SAFETY CHECK: Only fly to center if it has valid numbers
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      map.flyTo(center, map.getZoom());
    }
  }, [center, map]);

  useEffect(() => {
    const handleMoveEnd = () => {
      onMoveEnd(map.getCenter());
    };
    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onMoveEnd]);

  return null;
}

// --- INTERNAL COMPONENT: LOCATION PICKER ---
const LocationPicker = ({ coordinates, setCoordinates, setAddressText }) => {
  // Default: Daet, Camarines Norte
  const defaultCenter = useMemo(() => ({ lat: 14.11, lng: 122.95 }), []);
  
  // Initialize with coordinates OR default, but ensure it's never null
  const [mapCenter, setMapCenter] = useState(coordinates || defaultCenter);
  const [loadingLoc, setLoadingLoc] = useState(false);

  // Sync prop changes to local state
  useEffect(() => {
    if (coordinates && coordinates.lat && coordinates.lng) {
      setMapCenter(coordinates);
    }
  }, [coordinates]);

  const fetchAddressName = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',').slice(0, 4).join(',');
        setAddressText(parts);
      }
    } catch (error) {
      console.error("Error fetching address", error);
    }
  };

  const handleMapMove = (newCenter) => {
    setCoordinates({ lat: newCenter.lat, lng: newCenter.lng });
    fetchAddressName(newCenter.lat, newCenter.lng);
  };

  const handleLocateMe = () => {
    setLoadingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setMapCenter(newPos);
          setCoordinates(newPos);
          fetchAddressName(newPos.lat, newPos.lng);
          setLoadingLoc(false);
        },
        () => {
          alert("Could not access location.");
          setLoadingLoc(false);
        }
      );
    } else {
      setLoadingLoc(false);
    }
  };

  // SAFETY GUARD: If mapCenter somehow became invalid, fall back to default
  const safeCenter = (mapCenter && typeof mapCenter.lat === 'number') ? mapCenter : defaultCenter;

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-brand-primary/20 z-0 bg-gray-100">
      <MapContainer 
        center={[safeCenter.lat, safeCenter.lng]} 
        zoom={15} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MapController center={safeCenter} onMoveEnd={handleMapMove} />
      </MapContainer>

      {/* Pin Overlay */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none mb-4">
         <MapPinIcon className="w-10 h-10 text-red-600 drop-shadow-lg animate-bounce" />
      </div>

      {/* GPS Button */}
      <button
        type="button"
        onClick={handleLocateMe}
        className="absolute bottom-4 right-4 z-[400] bg-white p-2 rounded-full shadow-lg text-brand-primary hover:text-brand-accent transition-colors"
        title="Use my location"
      >
        <PaperAirplaneIcon className={`w-6 h-6 ${loadingLoc ? 'animate-pulse' : ''}`} />
      </button>
    </div>
  );
};

// --- INTERNAL COMPONENT: SIZE DROPDOWN ---
const SizeDropdown = ({ selectedSize, onSizeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sizes = ['Regular', 'Large'];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (size) => {
    onSizeChange(size);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative mt-1">
      <button onClick={() => setIsOpen(!isOpen)} className="relative w-full cursor-default rounded-lg bg-brand-light py-1.5 pl-3 pr-10 text-left shadow-sm border border-brand-primary/10 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all duration-200 hover:border-brand-primary/30">
        <span className="block truncate text-sm text-brand-primary/80">{selectedSize}</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDownIcon className="h-5 w-5 text-brand-primary/50" />
          </motion.div>
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 mt-1 w-full overflow-hidden rounded-md bg-white py-1 shadow-xl ring-2 ring-brand-primary/10 focus:outline-none"
            style={{ position: 'absolute', top: '100%', left: 0 }}
          >
            {sizes.map((size) => (
              <button key={size} onClick={() => handleSelect(size)}
                className={`relative w-full cursor-default select-none py-2 pl-10 pr-4 text-left transition-colors duration-150 ${
                  selectedSize === size ? 'bg-brand-secondary/50 text-brand-primary font-medium' : 'text-brand-primary/90 hover:bg-brand-secondary'
                }`}
              >
                <span className="block truncate">{size}</span>
                {selectedSize === size && (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brand-accent"><CheckIcon className="h-5 w-5" /></span>)}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- INTERNAL COMPONENT: CART ITEM ---
const CartItem = ({ item }) => {
  const { updateCartQuantity, toggleCartItemSelection, updateCartItemSize } = useAuth();
  
  const handleSizeChange = (newSize) => {
    updateCartItemSize(item.cartItemId, newSize);
  };

  return (
    <div className="flex items-start gap-3 py-4 border-b border-brand-primary/10">
      <input type="checkbox" checked={item.isSelected} onChange={() => toggleCartItemSelection(item.cartItemId)}
        className="w-5 h-5 rounded text-brand-primary focus:ring-brand-accent border-brand-primary/30 mt-1 flex-shrink-0" />
      <img src={item.imageURL || 'https://placehold.co/100x100/ffe4b5/ae6f44?text=Item'} alt={item.name} 
        className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="font-bold font-serif text-brand-primary truncate">{item.name}</h3>
        <SizeDropdown selectedSize={item.size} onSizeChange={handleSizeChange} />
        <p className="text-sm font-bold text-brand-accent mt-2">
          PHP {(item.price * item.quantity).toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-1 pt-1 flex-shrink-0">
        <button onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
          className="w-6 h-6 bg-brand-primary/10 rounded-full text-brand-primary hover:bg-brand-primary/20 transition-colors duration-150">
          {item.quantity === 1 ? (<TrashIcon className="w-4 h-4 m-auto" />) : (<MinusIcon className="w-4 h-4 m-auto" />)}
        </button>
        <span className="w-6 text-center font-bold text-brand-primary">{item.quantity}</span>
        <button onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
          className="w-6 h-6 bg-brand-primary/10 rounded-full text-brand-primary hover:bg-brand-primary/20 transition-colors duration-150">
          <PlusIcon className="w-4 h-4 m-auto" />
        </button>
      </div>
    </div>
  );
};

// --- MAIN CART MODAL COMPONENT ---
export default function CartModal({ closeModal, openSuccessModal }) {
  const { cart, clearFullCart, clearSelectedFromCart, toggleSelectAll, triggerOrderRefresh, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('cart'); 
  
  // --- NEW STATES FOR LOCATION & PHONE ---
  const [phone, setPhone] = useState('');
  const [coordinates, setCoordinates] = useState(null); 
  const [addressText, setAddressText] = useState('');
  const [instructions, setInstructions] = useState('');

  const selectedItems = cart.filter(item => item.isSelected);
  const subtotal = selectedItems.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity);
  }, 0);
  
  const allSelected = cart.length > 0 && cart.every(item => item.isSelected);
  const selectedCount = selectedItems.length;

  // --- LOAD SAVED DATA ---
  useEffect(() => {
    if (user) {
      if (user.defaultContactNumber) setPhone(user.defaultContactNumber);
      
      // Check for structured saved address (from updated Login API)
      if (user.savedAddress) {
        if (user.savedAddress.details) setAddressText(user.savedAddress.details);
        if (user.savedAddress.instructions) setInstructions(user.savedAddress.instructions);
        // SAFETY CHECK for coordinates
        if (user.savedAddress.coordinates && user.savedAddress.coordinates.lat) {
          setCoordinates({
            lat: parseFloat(user.savedAddress.coordinates.lat),
            lng: parseFloat(user.savedAddress.coordinates.lng)
          });
        }
      } 
      // Fallback for flat structure
      else {
         if (user.default_address) setAddressText(user.default_address);
         if (user.default_instructions) setInstructions(user.default_instructions);
         if (user.default_lat && user.default_lng) {
            setCoordinates({ lat: parseFloat(user.default_lat), lng: parseFloat(user.default_lng) });
         }
      }
    }
  }, [user]);

  const handleCheckout = async (e) => {
    e.preventDefault(); 
    setIsLoading(true);
    setError('');

    if (!phone || phone.length < 10) {
      setError('Please enter a valid contact number.');
      setIsLoading(false);
      return;
    }
    if (!coordinates || !addressText) {
      setError('Please pin your delivery location on the map.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post('/checkout', { 
        items: selectedItems,
        contactNumber: phone,
        deliveryAddress: addressText,
        coordinates: coordinates,
        instructions: instructions
      });
      
      if (res.status === 201) {
        clearSelectedFromCart(); 
        triggerOrderRefresh();
        closeModal(); 
        openSuccessModal(); 
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      setError(err.response?.data?.error || 'Checkout failed. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
      
      <motion.div
        className="relative z-10 w-full max-w-md h-full bg-brand-secondary shadow-2xl flex flex-col"
        initial={{ x: "100%" }} animate={{ x: "0%" }} exit={{ x: "100%" }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-primary/10 flex-shrink-0 bg-white/50 backdrop-blur-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-4"
            >
              {view === 'checkout' && (
                <button onClick={() => setView('cart')} className="p-1 rounded-full text-brand-primary/50 hover:text-brand-primary">
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
              )}
              <h2 className="text-2xl font-bold font-serif text-brand-primary">
                {view === 'cart' ? 'Your Cart' : 'Checkout'}
              </h2>
            </motion.div>
          </AnimatePresence>
          <button onClick={closeModal} className="p-1 rounded-full text-brand-primary/50 hover:text-brand-primary transition-colors duration-150">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            
            {/* --- CART VIEW --- */}
            {view === 'cart' && (
              <motion.div key="cart" exit={{ opacity: 0, x: -50 }}>
                {cart.length > 0 && (
                  <div className="p-4 px-6 flex justify-between items-center border-b border-brand-primary/10 bg-brand-light/30">
                    <label htmlFor="select-all" className="flex items-center gap-2 text-sm text-brand-primary/80 cursor-pointer">
                      <input 
                        id="select-all" type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                        className="w-5 h-5 rounded text-brand-primary focus:ring-brand-accent border-brand-primary/30"
                      />
                      Select All
                    </label>
                    <button onClick={clearFullCart} className="text-sm text-brand-primary/50 hover:text-red-500 transition-colors">
                      Clear Cart
                    </button>
                  </div>
                )}
                <div className="p-6 space-y-4 pb-20">
                  {cart.length === 0 ? (
                    <div className="text-center text-brand-primary/70 mt-20">
                      <ShoppingBagIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-bold font-serif">Your cart is empty!</h3>
                      <p>Looks like you haven't added any treats yet.</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <motion.div key={item.stableId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <CartItem item={item} />
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* --- CHECKOUT VIEW --- */}
            {view === 'checkout' && (
              <motion.form
                key="checkout"
                className="p-6 pb-24 space-y-8"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleCheckout}
              >
                {/* Contact Info */}
                <div className="space-y-3">
                   <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary/60 flex items-center gap-2">
                     <PhoneIcon className="w-4 h-4" /> Contact Info
                   </h3>
                   
                   <div className="relative flex items-center group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <span className="text-lg mr-2">🇵🇭</span>
                        <span className="text-brand-primary font-bold border-r border-brand-primary/20 pr-2">+63</span>
                      </div>
                      <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) setPhone(val);
                        }}
                        placeholder="912 345 6789"
                        className="w-full pl-[5.5rem] pr-4 py-3 bg-white rounded-xl border-2 border-brand-primary/10 
                                   text-brand-primary font-medium text-lg tracking-wide placeholder-brand-primary/30
                                   focus:border-brand-accent focus:ring-0 transition-all duration-200"
                        required
                      />
                   </div>
                   <p className="text-xs text-brand-primary/50 ml-1">We'll call this number for delivery updates.</p>
                </div>

                {/* Map & Location */}
                <div className="space-y-3">
                   <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary/60 flex items-center gap-2">
                     <MapPinIcon className="w-4 h-4" /> Delivery Location
                   </h3>
                   
                   {/* Map Component with Safeguard */}
                   <LocationPicker 
                      coordinates={coordinates} 
                      setCoordinates={setCoordinates} 
                      setAddressText={setAddressText}
                   />

                   <div className="bg-white p-3 rounded-lg border border-brand-primary/10 shadow-sm">
                      <p className="text-xs text-brand-primary/50 uppercase font-bold mb-1">Detected Address</p>
                      <p className="text-sm text-brand-primary font-medium leading-relaxed">
                        {addressText || "Drag the map to pin location..."}
                      </p>
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-brand-primary/70 mb-2 ml-1">
                       Landmark / Specific Instructions
                     </label>
                     <textarea 
                       value={instructions}
                       onChange={(e) => setInstructions(e.target.value)}
                       rows={2}
                       placeholder="e.g. Green gate, near the basketball court, 2nd floor..."
                       className="w-full px-4 py-3 bg-white rounded-xl border-2 border-brand-primary/10 
                                  text-brand-primary text-sm focus:border-brand-accent focus:ring-0 transition-all"
                     />
                   </div>
                </div>

                {/* Payment */}
                <div className="space-y-3">
                   <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary/60 flex items-center gap-2">
                     <BanknotesIcon className="w-4 h-4" /> Payment
                   </h3>
                   <div className="relative overflow-hidden group cursor-pointer">
                      <div className="absolute inset-0 bg-brand-accent/5 group-hover:bg-brand-accent/10 transition-colors" />
                      <div className="relative flex items-center p-4 border-2 border-brand-accent rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent mr-4">
                           <BanknotesIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-brand-primary">Cash on Delivery</p>
                          <p className="text-xs text-brand-primary/70">Pay securely when your order arrives.</p>
                        </div>
                        <div className="ml-auto">
                           <div className="w-6 h-6 rounded-full bg-brand-accent flex items-center justify-center">
                              <CheckIcon className="w-4 h-4 text-white" />
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-brand-primary/10 bg-brand-light/50 backdrop-blur-md flex-shrink-0">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="bg-red-100 text-red-600 p-3 rounded-lg text-sm text-center mb-4 border border-red-200"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-brand-primary/80">Total Amount</span>
              <span className="text-2xl font-bold font-serif text-brand-primary">
                PHP {subtotal.toFixed(2)}
              </span>
            </div>
            
            {view === 'cart' ? (
              <button onClick={() => setView('checkout')} disabled={selectedCount === 0}
                className="w-full bg-brand-primary text-brand-light text-lg font-bold p-4 rounded-xl shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                {selectedCount > 0 ? `Checkout (${selectedCount} item${selectedCount > 1 ? 's' : ''})` : 'Select items to checkout'}
              </button>
            ) : (
              <button onClick={handleCheckout} disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-accent to-brand-primary text-white text-lg font-bold p-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                   Processing...
                  </>
                ) : (
                  <>Place Order Now</>
                )}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}