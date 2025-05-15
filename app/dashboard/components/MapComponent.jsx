'use client'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapComponent({ pois, selectedPOI, onPOISelected }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  
  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([51.505, -0.09], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current)
    }
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    
    // Add new markers
    pois.forEach(poi => {
      const marker = L.marker([poi.latitude, poi.longitude])
        .addTo(mapInstance.current)
        .bindPopup(`<b>${poi.name}</b><br>${poi.address}`)
        .on('click', () => onPOISelected(poi))
      
      markersRef.current.push(marker)
      
      if (selectedPOI?.id === poi.id) {
        marker.openPopup()
        mapInstance.current.setView([poi.latitude, poi.longitude], 13)
      }
    })
    
  }, [pois, selectedPOI])
  
  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
}