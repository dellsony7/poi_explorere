'use client'
import { useState } from 'react'
import { Input, Button, message } from 'antd'
import { addPOIToLocalDB } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth'

export default function SearchBar({ onPOIAdded }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  
  const searchPOIs = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      )
      const data = await response.json()
      setResults(data)
    } catch (error) {
      message.error('Failed to search POIs')
    } finally {
      setLoading(false)
    }
  }
  
  const addPOI = async (poi) => {
    const user = await getCurrentUser()
    const newPOI = {
      id: crypto.randomUUID(),
      user_id: user.id,
      name: poi.display_name.split(',')[0],
      address: poi.display_name,
      latitude: parseFloat(poi.lat),
      longitude: parseFloat(poi.lon),
      category: poi.type,
      is_synced: navigator.onLine
    }
    
    await addPOIToLocalDB(newPOI)
    onPOIAdded(newPOI)
    setResults([])
    setQuery('')
    message.success('POI added successfully')
  }
  
  return (
    <div style={{ padding: '16px' }}>
      <Input.Search
        placeholder="Search for POIs"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onSearch={searchPOIs}
        enterButton
        loading={loading}
      />
      {results.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          {results.map(poi => (
            <div 
              key={poi.place_id} 
              style={{ 
                padding: '8px', 
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer'
              }}
              onClick={() => addPOI(poi)}
            >
              <div><strong>{poi.display_name.split(',')[0]}</strong></div>
              <div style={{ fontSize: '0.8em' }}>{poi.display_name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}