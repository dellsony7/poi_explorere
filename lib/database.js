//import { PGlite } from '@electric-sql/pglite'
//import { supabase } from './supabase'

//let db

//export const initDB = async () => {
//  if (!db) {
//    db = new PGlite()
//    await setupSchema()
//  }
//  return db
//}

//const setupSchema = async () => {
//  await db.query(`
//    CREATE TABLE IF NOT EXISTS users (
//      id UUID PRIMARY KEY,
//      email TEXT UNIQUE NOT NULL,
//      created_at TIMESTAMP DEFAULT NOW()
//    )
//  `)
  
//  await db.query(`
//    CREATE TABLE IF NOT EXISTS pois (
//      id UUID PRIMARY KEY,
//      user_id UUID REFERENCES users(id),
//      name TEXT NOT NULL,
//      address TEXT,
//      latitude FLOAT,
//      longitude FLOAT,
//      category TEXT,
//      created_at TIMESTAMP DEFAULT NOW(),
//      is_synced BOOLEAN DEFAULT FALSE
//    )
//  `)
  
//  await db.query(`
//    CREATE TABLE IF NOT EXISTS search_history (
//      id UUID PRIMARY KEY,
//      user_id UUID REFERENCES users(id),
//      query TEXT NOT NULL,
//      created_at TIMESTAMP DEFAULT NOW()
//    )
//  `)
//}

//export const addPOIToLocalDB = async (poi) => {
//  const db = await initDB()
//  await db.query(
//    `INSERT INTO pois (id, user_id, name, address, latitude, longitude, category, is_synced)
//     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
//    [poi.id, poi.user_id, poi.name, poi.address, poi.latitude, poi.longitude, poi.category, false]
//  )
//}

//export const syncLocalPOIs = async (userId) => {
//  const db = await initDB()
//  const { rows: unsyncedPOIs } = await db.query(
//    'SELECT * FROM pois WHERE user_id = $1 AND is_synced = FALSE',
//    [userId]
//  )
  
//  for (const poi of unsyncedPOIs) {
//    const { error } = await supabase.from('pois').insert(poi)
//    if (!error) {
//      await db.query(
//        'UPDATE pois SET is_synced = TRUE WHERE id = $1',
//        [poi.id]
//      )
//    }
//  }
//}

//export const exportPOIsToJSON = async (userId) => {
//  const db = await initDB()
//  const { rows } = await db.query(
//    'SELECT * FROM pois WHERE user_id = $1',
//    [userId]
//  )
  
//  const dataStr = JSON.stringify(rows, null, 2)
//  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
//  const link = document.createElement('a')
//  link.setAttribute('href', dataUri)
//  link.setAttribute('download', 'pois_export.json')
//  document.body.appendChild(link)
//  link.click()
//  document.body.removeChild(link)
//}