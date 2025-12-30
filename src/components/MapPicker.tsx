import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapPickerProps {
  latitude: number | null
  longitude: number | null
  onLocationSelect: (lat: number, lng: number) => void
  height?: string
}

function LocationMarker({ 
  latitude, 
  longitude, 
  onLocationSelect 
}: { 
  latitude: number | null
  longitude: number | null
  onLocationSelect: (lat: number, lng: number) => void 
}) {
  const [position, setPosition] = useState<[number, number] | null>(
    latitude !== null && longitude !== null ? [latitude, longitude] : null
  )

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      setPosition([latitude, longitude])
    }
  }, [latitude, longitude])

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setPosition([lat, lng])
      onLocationSelect(lat, lng)
    },
  })

  return position === null ? null : <Marker position={position} />
}

export default function MapPicker({ latitude, longitude, onLocationSelect, height = '400px' }: MapPickerProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]) // Default: London

  useEffect(() => {
    // If we have coordinates, use them as center and show marker
    if (latitude !== null && longitude !== null) {
      setMapCenter([latitude, longitude])
    } else {
      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setMapCenter([position.coords.latitude, position.coords.longitude])
          },
          () => {
            // If geolocation fails, keep default center
          }
        )
      }
    }
  }, [latitude, longitude])

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-300" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={latitude && longitude ? 15 : 2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          latitude={latitude}
          longitude={longitude}
          onLocationSelect={onLocationSelect} 
        />
      </MapContainer>
    </div>
  )
}

