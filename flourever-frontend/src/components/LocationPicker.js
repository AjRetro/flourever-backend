import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { MapPinIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet markers not showing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to handle map movement
function MapController({ center, onMoveEnd }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) map.flyTo(center, map.getZoom());
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

const LocationPicker = ({ coordinates, setCoordinates, setAddressText }) => {
  // Default Center: Daet, Camarines Norte
  const defaultCenter = useMemo(() => ({ lat: 14.11, lng: 122.95 }), []);
  const [mapCenter, setMapCenter] = useState(coordinates || defaultCenter);
  const [loadingLoc, setLoadingLoc] = useState(false);

  // Function to get text address from coordinates (Reverse Geocoding)
  const fetchAddressName = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        // Clean up the address string
        const parts = data.display_name.split(',').slice(0, 4).join(',');
        setAddressText(parts);
      }
    } catch (error) {
      console.error("Error fetching address name", error);
    }
  };

  // When user drags the map
  const handleMapMove = (newCenter) => {
    setCoordinates({ lat: newCenter.lat, lng: newCenter.lng });
    fetchAddressName(newCenter.lat, newCenter.lng);
  };

  // "Use My Location" button logic
  const handleLocateMe = () => {
    setLoadingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
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
    }
  };

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-brand-primary/20 z-0">
      <MapContainer 
        center={[mapCenter.lat, mapCenter.lng]} 
        zoom={15} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MapController center={mapCenter} onMoveEnd={handleMapMove} />
      </MapContainer>

      {/* Center Pin Overlay */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none mb-4">
         <MapPinIcon className="w-10 h-10 text-red-600 drop-shadow-lg animate-bounce" />
      </div>

      {/* Locate Me Button */}
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

export default LocationPicker;