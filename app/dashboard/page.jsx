'use client'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { initDB, syncLocalPOIs } from '@/lib/database'
import MapComponent from './components/MapComponent'
import POIList from './components/POIList'
import SearchBar from './components/SearchBar'
import { Button, Layout, Menu, theme } from 'antd'
const { Header, Content, Sider } = Layout

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [pois, setPois] = useState([])
  const [selectedPOI, setSelectedPOI] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser()
      if (!user) window.location.href = '/login'
      setUser(user)
      await initDB()
      if (isOnline) await syncLocalPOIs(user.id)
      loadPOIs(user.id)
    }
    
    checkAuth()
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isOnline])
  
  const loadPOIs = async (userId) => {
    if (isOnline) {
      const { data, error } = await supabase.from('pois').select('*').eq('user_id', userId)
      if (!error) setPois(data)
    } else {
      const db = await initDB()
      const { rows } = await db.query('SELECT * FROM pois WHERE user_id = $1', [userId])
      setPois(rows)
    }
  }
  
  const handlePOISelected = (poi) => {
    setSelectedPOI(poi)
  }
  
  const handlePOIAdded = (newPOI) => {
    setPois([...pois, newPOI])
  }
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="demo-logo" />
        <Menu theme="dark" mode="horizontal" />
        <Button danger onClick={() => signOut()}>Logout</Button>
      </Header>
      <Layout>
        <Sider width={300} style={{ background: '#fff' }}>
          <SearchBar onPOIAdded={handlePOIAdded} />
          <POIList 
            pois={pois} 
            onPOISelected={handlePOISelected} 
            currentLocation={selectedPOI?.geometry?.coordinates} 
          />
        </Sider>
        <Content style={{ padding: '20px' }}>
          <MapComponent 
            pois={pois} 
            selectedPOI={selectedPOI} 
            onPOISelected={handlePOISelected} 
          />
        </Content>
      </Layout>
    </Layout>
  )
}