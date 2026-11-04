import { useEffect, useState } from 'react'
import Landing from './pages/Landing'
import Admin from './pages/Admin'

export default function App() {
  const [route, setRoute] = useState(() => window.location.hash || '#/')
  useEffect(() => {
    const on = () => { setRoute(window.location.hash || '#/'); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route.startsWith('#/admin') ? <Admin /> : <Landing />
}
