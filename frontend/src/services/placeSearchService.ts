import axios from 'axios'

const photon = axios.create({ baseURL: 'https://photon.komoot.io/api' })

export interface PlaceSuggestion {
  id: string
  name: string
  label: string
  lat: number
  lon: number
}

interface PhotonProperties {
  osm_id: number
  name?: string
  city?: string
  state?: string
  country?: string
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] }
  properties: PhotonProperties
}

interface PhotonResponse {
  features: PhotonFeature[]
}

export interface LocationBias {
  lat: number
  lon: number
}

function formatLabel(props: PhotonProperties): string {
  return [props.name, props.city, props.state, props.country].filter(Boolean).join(', ')
}

function buildBoundingBox({ lat, lon }: LocationBias, radiusKm = 30): string {
  const latDelta = radiusKm / 111
  const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))
  return [lon - lonDelta, lat - latDelta, lon + lonDelta, lat + latDelta].join(',')
}

export async function searchPlaces(query: string, near?: LocationBias): Promise<PlaceSuggestion[]> {
  if (query.trim().length < 3) return []

  const params: Record<string, string | number> = { q: query, limit: 5 }
  if (near) {
    params.lat = near.lat
    params.lon = near.lon
    params.bbox = buildBoundingBox(near)
  }

  const { data } = await photon.get<PhotonResponse>('/', { params })

  return data.features
    .filter((feature) => feature.properties.name)
    .map((feature) => ({
      id: String(feature.properties.osm_id),
      name: feature.properties.name as string,
      label: formatLabel(feature.properties),
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
    }))
}

export async function geocodeCity(name: string): Promise<LocationBias | null> {
  const [first] = await searchPlaces(name)
  return first ? { lat: first.lat, lon: first.lon } : null
}

export function buildMapsLink(lat: number, lon: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
}

export function buildMapsSearchLink(name: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
}
