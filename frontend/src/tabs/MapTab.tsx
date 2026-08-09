import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getCities, type City } from '../services/cityService'
import { geocodeCity, buildMapsSearchLink } from '../services/placeSearchService'

interface MapPin {
  id: string
  lat: number
  lon: number
  name: string
  cityName: string
  mapsLink: string
  kind: 'city' | 'place'
}

function parseCoordsFromMapsLink(mapsLink: string): { lat: number; lon: number } | null {
  const match = mapsLink.match(/query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (!match) return null
  return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) }
}

function pinIcon(emoji: string) {
  return L.divIcon({
    html: `<span style="font-size:1.75rem;line-height:1;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))">${emoji}</span>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 26],
    popupAnchor: [0, -24],
  })
}

const CITY_ICON = pinIcon('📍')
const PLACE_ICON = pinIcon('⭐')

async function buildPins(cities: City[]): Promise<MapPin[]> {
  const pins: MapPin[] = []

  for (const city of cities) {
    const cityCoords = await geocodeCity(city.name).catch(() => null)
    if (cityCoords) {
      pins.push({
        id: `city-${city.id}`,
        lat: cityCoords.lat,
        lon: cityCoords.lon,
        name: city.name,
        cityName: city.name,
        mapsLink: buildMapsSearchLink(city.name),
        kind: 'city',
      })
    }

    for (const place of city.places) {
      const coords = parseCoordsFromMapsLink(place.mapsLink)
      if (coords) {
        pins.push({
          id: `place-${place.id}`,
          lat: coords.lat,
          lon: coords.lon,
          name: place.name,
          cityName: city.name,
          mapsLink: place.mapsLink,
          kind: 'place',
        })
      }
    }
  }

  return pins
}

export default function MapTab({ tripId }: { tripId: number }) {
  const [cities, setCities] = useState<City[] | null>(null)
  const [pins, setPins] = useState<MapPin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCities(tripId)
      .then(setCities)
      .catch(() => setError('No se pudieron cargar las ciudades'))
  }, [tripId])

  useEffect(() => {
    if (cities === null) return
    buildPins(cities)
      .then(setPins)
      .catch(() => setError('No se pudo ubicar alguna ciudad o lugar en el mapa'))
      .finally(() => setLoading(false))
  }, [cities])

  const bounds = useMemo<[number, number][] | null>(() => {
    if (pins.length === 0) return null
    return pins.map((p) => [p.lat, p.lon])
  }, [pins])

  if (loading) return <p className="text-center py-12 text-foreground/40">Ubicando ciudades y lugares...</p>
  if (error) return <p className="text-center py-12 text-error">{error}</p>

  if (!bounds) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">🧭</div>
        <p className="font-heading font-bold text-lg text-foreground mb-1">Sin ubicaciones todavía</p>
        <p className="text-foreground/50 text-sm">Agregá ciudades o lugares para verlos en el mapa</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl overflow-hidden border border-foreground/8 h-[60vh] min-h-[360px]">
        <MapContainer bounds={bounds} boundsOptions={{ padding: [40, 40] }} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pins.map((pin) => (
            <Marker key={pin.id} position={[pin.lat, pin.lon]} icon={pin.kind === 'city' ? CITY_ICON : PLACE_ICON}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{pin.name}</p>
                  {pin.kind === 'place' && <p className="text-xs text-foreground/50">{pin.cityName}</p>}
                  <a href={pin.mapsLink} target="_blank" rel="noopener noreferrer" className="text-secondary text-xs">Ver en Google Maps</a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <p className="text-xs text-foreground/40 mt-3 text-center">
        📍 Ciudades · ⭐ Lugares a visitar con coordenadas guardadas
      </p>
    </div>
  )
}
