'use client'
import { List, Button, Space, Typography, InputNumber } from 'antd'
import { useState } from 'react'
import { calculateDistance } from '@/lib/geospatial'

export default function POIList({ pois, onPOISelected, currentLocation }) {
  const [sortBy, setSortBy] = useState('name')
  const [filterRadius, setFilterRadius] = useState(null)
  
  const sortedPOIs = [...pois].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'distance' && currentLocation) {
      return calculateDistance(currentLocation, [a.latitude, a.longitude]) - 
             calculateDistance(currentLocation, [b.latitude, b.longitude])
    }
    return 0
  })
  
  const filteredPOIs = filterRadius && currentLocation 
    ? sortedPOIs.filter(poi => 
        calculateDistance(currentLocation, [poi.latitude, poi.longitude]) <= filterRadius
      )
    : sortedPOIs
  
  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => setSortBy('name')}>Sort by Name</Button>
        <Button 
          onClick={() => setSortBy('distance')} 
          disabled={!currentLocation}
        >
          Sort by Distance
        </Button>
        <InputNumber
          placeholder="Filter radius (km)"
          min={1}
          onChange={setFilterRadius}
          style={{ width: 120 }}
        />
      </Space>
      <List
        dataSource={filteredPOIs}
        renderItem={poi => (
          <List.Item 
            onClick={() => onPOISelected(poi)}
            style={{ cursor: 'pointer' }}
          >
            <List.Item.Meta
              title={poi.name}
              description={
                <>
                  <Typography.Text>{poi.address}</Typography.Text><br />
                  {currentLocation && (
                    <Typography.Text type="secondary">
                      {calculateDistance(currentLocation, [poi.latitude, poi.longitude]).toFixed(2)} km away
                    </Typography.Text>
                  )}
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  )
}