'use client'
import { useEffect, useState } from 'react'
import { getCurrentUser, signOut } from '@/lib/auth'
import { initDB } from '@/lib/database'
import MapComponent from './components/MapComponent'
import POIList from './components/POIList'
import SearchBar from './components/SearchBar'
import { Button, Layout, Menu, message } from 'antd'
const { Header, Content, Sider } = Layout
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [pois, setPois] = useState([])
  const [selectedPOI, setSelectedPOI] = useState(null)
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true)
  const [db, setDb] = useState(null)

  // Initialize database and load data
  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. Authenticate user
        const user = await getCurrentUser()
        if (!user) {
          window.location.href = '/login'
          return
        }
        setUser(user)

        // 2. Initialize local DB
        const database = await initDB()
        setDb(database)
        
        // 3. Load initial data (from local first, then sync if online)
        await loadInitialData(database, user.id)
        
      } catch (error) {
        console.error('Initialization failed:', error)
        message.error('Failed to initialize application')
      }
    }

    initialize()

    // Network status listeners
    const handleOnline = () => {
      setIsOnline(true)
      message.info('Online - syncing changes...')
      if (db && user) syncLocalChanges(db, user.id)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      message.warning('Offline - working locally')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load data with offline-first approach
  const loadInitialData = async (database, userId) => {
    try {
      // 1. Always load from local DB first (for instant display)
      const { rows: localPois } = await database.query(
        'SELECT * FROM pois WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      )
      setPois(localPois || [])
      
      // 2. If online, sync with Supabase
      if (isOnline) {
        const { data: remotePois, error } = await supabase
          .from('pois')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (!error && remotePois) {
          setPois(remotePois)
          // Update local DB with fresh data
          await database.query('DELETE FROM pois WHERE user_id = $1', [userId])
          for (const poi of remotePois) {
            await database.query(
              `INSERT INTO pois (id, user_id, name, address, latitude, longitude, category, created_at, is_synced)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [poi.id, poi.user_id, poi.name, poi.address, poi.latitude, 
               poi.longitude, poi.category, poi.created_at, true]
            )
          }
        }
      }
    } catch (error) {
      console.error('Data loading failed:', error)
    }
  }

  // Sync local changes to Supabase
  const syncLocalChanges = async (database, userId) => {
    try {
      const { rows: unsynced } = await database.query(
        'SELECT * FROM pois WHERE user_id = $1 AND is_synced = FALSE',
        [userId]
      )
      
      for (const poi of unsynced) {
        const { error } = await supabase.from('pois').upsert(poi)
        if (!error) {
          await database.query(
            'UPDATE pois SET is_synced = TRUE WHERE id = $1',
            [poi.id]
          )
        }
      }
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  // Handle new POI additions
  const handlePOIAdded = async (newPOI) => {
    try {
      // Optimistic UI update
      setPois(prev => [newPOI, ...prev])
      
      // Add to local DB
      await db.query(
        `INSERT INTO pois (id, user_id, name, address, latitude, longitude, category, created_at, is_synced)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)`,
        [newPOI.id, newPOI.user_id, newPOI.name, newPOI.address, 
         newPOI.latitude, newPOI.longitude, newPOI.category, isOnline]
      )
      
      // If online, sync immediately
      if (isOnline) {
        const { error } = await supabase.from('pois').upsert(newPOI)
        if (!error) {
          await db.query(
            'UPDATE pois SET is_synced = TRUE WHERE id = $1',
            [newPOI.id]
          )
        }
      }
      
      message.success('Location saved successfully!')
      
    } catch (error) {
      console.error('Failed to add POI:', error)
      setPois(prev => prev.filter(p => p.id !== newPOI.id))
      message.error('Failed to save location')
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="demo-logo" />
        <Button danger onClick={() => signOut()}>Logout</Button>
      </Header>
      <Layout>
        <Sider width={400} style={{ background: '#fff', padding: '16px' }}>
          <SearchBar onPOIAdded={handlePOIAdded} />
          <POIList 
            pois={pois} 
            onPOISelected={setSelectedPOI} 
            currentLocation={selectedPOI?.geometry?.coordinates} 
          />
        </Sider>
        <Content style={{ padding: '0' }}>
          <MapComponent 
            pois={pois} 
            selectedPOI={selectedPOI} 
            onPOISelected={setSelectedPOI} 
          />
        </Content>
      </Layout>
    </Layout>
  )
}