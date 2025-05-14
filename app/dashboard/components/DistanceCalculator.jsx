'use client'
import { Card, Typography } from 'antd'
import { calculateDistance } from '@/lib/geospatial'

const { Text, Title } = Typography

export default function DistanceCalculator({ poi1, poi2 }) {
  const distance = calculateDistance(
    [poi1.latitude, poi1.longitude],
    [poi2.latitude, poi2.longitude]
  )

  return (
    <Card size="small" title="Distance Between Selected POIs">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Text strong>{poi1.name}</Text>
        <Text strong>{poi2.name}</Text>
      </div>
      <Title level={4} style={{ textAlign: 'center', margin: '16px 0' }}>
        {distance.toFixed(2)} km
      </Title>
    </Card>
  )
}