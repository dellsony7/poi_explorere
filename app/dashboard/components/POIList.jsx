'use client'
import { List, Button, Space, Typography, InputNumber, Card } from 'antd'
import { useState } from 'react'
import { calculateDistance } from '@/lib/geospatial'

const { Text } = Typography

export default function POIList({ pois, selectedPOIs, onPOISelected, currentLocation }) {
  const [sortBy, setSortBy] = useState('name')
  const [filterRadius, setFilterRadius] = useState(null)
  
  const sortedPOIs = [...pois].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'distance' && currentLocation) {
      return calculateDistance([currentLocation.lat, currentLocation.lng], [a.latitude, a.longitude]) - 
             calculateDistance([currentLocation.lat, currentLocation.lng], [b.latitude, b.longitude])
    }
    return 0
  })
  
  const filteredPOIs = filterRadius && currentLocation 
    ? sortedPOIs.filter(poi => 
        calculateDistance([currentLocation.lat, currentLocation.lng], [poi.latitude, poi.longitude]) <= filterRadius
      )
    : sortedPOIs

  return (
    <Card size="small">
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Button 
            size="small"
            onClick={() => setSortBy('name')}
            type={sortBy === 'name' ? 'primary' : 'default'}
          >
            Sort by Name
          </Button>
          <Button 
            size="small"
            onClick={() => setSortBy('distance')} 
            disabled={!currentLocation}
            type={sortBy === 'distance' ? 'primary' : 'default'}
          >
            Sort by Distance
          </Button>
        </Space>
        <InputNumber
          size="small"
          placeholder="Radius (km)"
          min={1}
          onChange={setFilterRadius}
          style={{ width: 90 }}
          value={filterRadius}
        />
      </Space>
      
      <List
        size="small"
        dataSource={filteredPOIs}
        renderItem={poi => (
          <List.Item 
            onClick={() => onPOISelected(poi)}
            style={{ 
              cursor: 'pointer',
              backgroundColor: selectedPOIs.some(p => p.id === poi.id) ? '#f0f7ff' : 'inherit',
              padding: '8px 12px'
            }}
          >
            <List.Item.Meta
              title={<Text strong>{poi.name}</Text>}
              description={
                <>
                  <Text ellipsis>{poi.address}</Text>
                  {currentLocation && (
                    <>
                      <br />
                      <Text type="secondary">
                        {calculateDistance(
                          [currentLocation.lat, currentLocation.lng],
                          [poi.latitude, poi.longitude]
                        ).toFixed(2)} km away
                      </Text>
                    </>
                  )}
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  )
}