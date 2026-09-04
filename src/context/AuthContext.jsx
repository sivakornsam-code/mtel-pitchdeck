import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(current => current === undefined ? null : current))

    // Safety net so a getSession() that never settles can't leave the app stuck
    // on the loading spinner. It may only resolve the *initial* unknown state —
    // using the updater form matters, because a plain setSession(null) here would
    // overwrite a good session that onAuthStateChange had already delivered and
    // bounce a signed-in user to /login. Slow token refreshes hit this often
    // enough on a cold Supabase project that the old 3s deadline misfired.
    const timeout = setTimeout(() => {
      setSession(current => current === undefined ? null : current)
    }, 8000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading: session === undefined }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
