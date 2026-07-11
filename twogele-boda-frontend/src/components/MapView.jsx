import { useEffect, useId, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix default marker paths under Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export const KAMPALA_CENTER = [0.3476, 32.5825]

export const HAZARD_MARKERS = [
  {
    id: 'nakivubo',
    position: [0.3142, 32.5758],
    title: 'Heavy Flooding',
    detail: 'Nakivubo Channel overspill. High risk for Bodas.',
    tone: 'danger',
    icon: 'flood',
  },
  {
    id: 'clock-tower',
    position: [0.3136, 32.5811],
    title: 'Gridlock',
    detail: 'Clock Tower Junction congestion. Prefer Lumumba Ave.',
    tone: 'warn',
    icon: 'traffic',
  },
  {
    id: 'entebbe',
    position: [0.2985, 32.5682],
    title: 'Road Closure',
    detail: 'Entebbe Rd near Kibuye — lane restricted for works.',
    tone: 'danger',
    icon: 'construction',
  },
]

export const DEMAND_MARKERS = [
  {
    id: 'katwe',
    position: [0.3012, 32.5764],
    title: 'High Demand',
    detail: 'Katwe stage — elevated trip requests.',
    tone: 'ok',
    icon: 'local_taxi',
  },
  {
    id: 'wandegeya',
    position: [0.3335, 32.5678],
    title: 'High Demand',
    detail: 'Wandegeya campus peak hours.',
    tone: 'ok',
    icon: 'local_taxi',
  },
]

function pinIcon(tone) {
  const color =
    tone === 'danger' ? '#ba1a1a' : tone === 'warn' ? '#f59e0b' : tone === 'ok' ? '#047857' : '#855300'
  return L.divIcon({
    className: 'twogele-pin',
    html: `<span style="
      display:grid;place-items:center;width:2rem;height:2rem;border-radius:999px;
      background:${color};color:#fff;border:2px solid #fff;
      box-shadow:0 4px 12px rgba(69,26,3,0.25);font-size:0.7rem;font-weight:700;
    ">●</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

/**
 * Interactive OpenStreetMap of Kampala with hazard / demand markers.
 */
export default function MapView({
  markers = HAZARD_MARKERS,
  center = KAMPALA_CENTER,
  zoom = 13,
  className = '',
  style,
}) {
  const mapId = useId().replace(/:/g, '')
  const mapRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center,
      zoom,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    markers.forEach((m) => {
      L.marker(m.position, { icon: pinIcon(m.tone) })
        .addTo(map)
        .bindPopup(`<strong>${m.title}</strong><br/>${m.detail}`)
    })

    mapRef.current = map

    // Leaflet needs a resize after layout settles
    const t = window.setTimeout(() => map.invalidateSize(), 80)

    return () => {
      window.clearTimeout(t)
      map.remove()
      mapRef.current = null
    }
  }, [center, zoom, markers])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setView(center, zoom)
  }, [center, zoom])

  return (
    <div
      id={`map-${mapId}`}
      ref={containerRef}
      className={`map-view ${className}`.trim()}
      style={style}
      role="img"
      aria-label="Kampala map"
    />
  )
}
