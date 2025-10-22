import { config } from 'dotenv'
config()

export const PORT = process.env.PORT || 3000
export const SUPABASE_URL = process.env.SUPABASE_URL
export const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
