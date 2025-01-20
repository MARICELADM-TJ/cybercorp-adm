import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Configuración para evitar el icono por defecto roto de Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41], // Ajuste para posicionar correctamente el pin
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapWithMarker = ({ onLocationChange, defaultLocation }) => {
  const [position, setPosition] = useState(defaultLocation);

  // Actualizar la posición del marcador cuando defaultLocation cambie
  useEffect(() => {
    setPosition(defaultLocation);
  }, [defaultLocation]);

  // Manejar clics en el mapa
  useMapEvents({
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      onLocationChange(newPosition); // Notificar el cambio al componente padre
    },
  });

  return position ? <Marker position={position} /> : null;
};

const Mapa = ({ onLocationChange, defaultLocation }) => {
  return (
    <MapContainer
      center={defaultLocation} // Centrar el mapa en la ubicación predeterminada
      zoom={14}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapWithMarker
        onLocationChange={onLocationChange}
        defaultLocation={defaultLocation} // Pasar la ubicación predeterminada
      />
    </MapContainer>
  );
};

export default Mapa;
