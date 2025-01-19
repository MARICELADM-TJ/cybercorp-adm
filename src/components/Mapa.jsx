import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configuración para evitar el icono por defecto roto de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41], // Ajuste para posicionar correctamente el pin
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapWithMarker = ({ onLocationChange }) => {
  const [position, setPosition] = useState([-21.53549, -64.72956]); // Tarija, Bolivia

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const Mapa = ({ onLocationChange }) => {
  return (
    <MapContainer
      center={[-21.53549, -64.72956]} // Centro en Tarija, Bolivia
      zoom={14}
      style={{ height: '300px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapWithMarker onLocationChange={onLocationChange} />
    </MapContainer>
  );
};

export default Mapa;
