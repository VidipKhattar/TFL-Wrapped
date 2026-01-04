import { WrappedData } from '../types'

//const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_BASE_URL = 'https://tfl-wrapped-production.up.railway.app/'

export async function fetchWrappedData(): Promise<WrappedData> {
  try {
    const response = await fetch(`${API_BASE_URL}/wrapped`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch wrapped data: ${response.statusText}`)
    }

    const data = await response.json()
    return data as WrappedData
  } catch (error) {
    console.error('Error fetching wrapped data:', error)
    throw error
  }
}

export async function uploadCSV(file: File): Promise<{ status: string; message: string; journey_count: number }> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || `Failed to upload CSV: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error uploading CSV:', error)
    throw error
  }
}

