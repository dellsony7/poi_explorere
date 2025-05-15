import { NextResponse } from 'next/server'
import { addPOIToLocalDB } from '@/lib/database'

export async function POST(request) {
  try {
    const newPOI = await request.json()
    await addPOIToLocalDB(newPOI)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
