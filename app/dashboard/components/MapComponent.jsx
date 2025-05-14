'use client'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapComponent({ pois, selectedPOIs, onPOISelected, theme, currentLocation }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  
  // Custom marker icons
  const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })
  
  const selectedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })
  
  const currentLocationIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })

  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      mapInstance.current = L.map(mapRef.current).setView([51.505, -0.09], 13)
      
      const tileUrl = theme === 'dark' 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      
      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current)
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    if (mapInstance.current) {
      // Add current location marker if available
      if (currentLocation) {
        const marker = L.marker([currentLocation.lat, currentLocation.lng], {
          icon: currentLocationIcon,
          zIndexOffset: 1000
        })
          .addTo(mapInstance.current)
          .bindPopup('Your current location')
        markersRef.current.push(marker)
      }

      // Add POI markers
      pois.forEach(poi => {
        const isSelected = selectedPOIs.some(p => p.id === poi.id)
        const marker = L.marker([poi.latitude, poi.longitude], {
          icon: isSelected ? selectedIcon : defaultIcon
        })
          .addTo(mapInstance.current)
          .bindPopup(`<b>${poi.name}</b><br>${poi.address}`)
          .on('click', () => onPOISelected(poi))
        
        markersRef.current.push(marker)
        
        if (isSelected) {
          marker.openPopup()
          mapInstance.current.setView([poi.latitude, poi.longitude], 13)
        }
      })

      // Fit bounds to show all markers if we have POIs
      if (pois.length > 0) {
        const group = new L.featureGroup(markersRef.current.map(m => m))
        mapInstance.current.fitBounds(group.getBounds().pad(0.2))
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [pois, selectedPOIs, theme, currentLocation])

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
}