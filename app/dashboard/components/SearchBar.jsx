'use client'
import { useState, useEffect } from 'react'
import { Input, Button, message, List, Space, Radio, Typography, Card } from 'antd'
import { HistoryOutlined, SearchOutlined } from '@ant-design/icons'
import { addPOIToLocalDB } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth'
const { Text } = Typography

export default function SearchBar({ onPOIAdded, searchHistory, currentLocation }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchMode, setSearchMode] = useState('name') // 'name' or 'category'
  const [showHistory, setShowHistory] = useState(false)

  const searchPOIs = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams({
        format: 'json',
        q: query,
        limit: 10,
        email: 'your-email@example.com' // Required by Nominatim usage policy
      })
      
      if (searchMode === 'category') {
        params.set('amenity', query)
      }
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            'User-Agent': 'POI Explorer App' // Required by Nominatim usage policy
          }
        }
      )
      
      const data = await response.json()
      setResults(data)
      setShowHistory(false)
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
      category: poi.type || searchMode === 'category' ? query : 'other',
      is_synced: navigator.onLine
    }
    
    await addPOIToLocalDB(newPOI)
    onPOIAdded(newPOI)
    setResults([])
    setQuery('')
    message.success('POI added successfully')
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Radio.Group 
          value={searchMode}
          onChange={(e) => setSearchMode(e.target.value)}
          buttonStyle="solid"
          style={{ width: '100%', display: 'flex' }}
        >
          <Radio.Button value="name" style={{ flex: 1, textAlign: 'center' }}>Search by Name</Radio.Button>
          <Radio.Button value="category" style={{ flex: 1, textAlign: 'center' }}>Search by Category</Radio.Button>
        </Radio.Group>
        
        <Input.Search
          placeholder={`Search for ${searchMode === 'name' ? 'location' : 'category (e.g., restaurant, hotel)'}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSearch={searchPOIs}
          enterButton={<SearchOutlined />}
          loading={loading}
          onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
        />
      </Space>

      {showHistory && searchHistory.length > 0 && (
        <Card 
          size="small" 
          title="Recent Searches"
          style={{ marginTop: '8px' }}
          extra={<Button type="link" size="small" onClick={() => setShowHistory(false)}>Close</Button>}
        >
          <List
            size="small"
            dataSource={searchHistory}
            renderItem={(item) => (
              <List.Item 
                style={{ padding: '8px', cursor: 'pointer' }}
                onClick={() => {
                  setQuery(item.query)
                  setShowHistory(false)
                }}
              >
                <HistoryOutlined style={{ marginRight: '8px' }} />
                <Text ellipsis>{item.query}</Text>
              </List.Item>
            )}
          />
        </Card>
      )}

      {results.length > 0 && (
        <Card size="small" style={{ marginTop: '8px' }}>
          <List
            size="small"
            dataSource={results}
            renderItem={(poi) => (
              <List.Item 
                style={{ padding: '8px', cursor: 'pointer' }}
                onClick={() => addPOI(poi)}
              >
                <List.Item.Meta
                  title={<Text strong>{poi.display_name.split(',')[0]}</Text>}
                  description={
                    <Text ellipsis type="secondary">
                      {poi.display_name}
                      {currentLocation && (
                        <>
                          <br />
                          <Text type="secondary" italic>
                            {calculateDistance(
                              [currentLocation.lat, currentLocation.lng],
                              [parseFloat(poi.lat), parseFloat(poi.lon)]
                            ).toFixed(2)} km away
                          </Text>
                        </>
                      )}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  )
}