import { createClient } from '@supabase/supabase-js'

export default async function handler(request, response) {
  const cronSecret = process.env.CRON_SECRET

  if (
    !cronSecret ||
    request.headers.authorization !== `Bearer ${cronSecret}`
  ) {
    return response.status(404).json({ error: 'Not found' })
  }

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response.status(500).json({
      success: false,
      error: 'Supabase environment variables are not configured',
    })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { error } = await supabase.from('decks').select('id').limit(1)

  if (error) {
    return response.status(500).json({
      success: false,
      error: error.message,
    })
  }

  return response.status(200).json({
    success: true,
    checkedAt: new Date().toISOString(),
  })
}
