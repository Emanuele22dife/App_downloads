import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useCustomRouter() {
  const router = useRouter()

  const customPush = (path: string) => {
    console.log('Attempting to navigate to:', path)
    router.push(path)
  }

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      console.log('Route changed to:', url)
    }

    // Aggiungi un listener per i cambiamenti di route
    window.addEventListener('popstate', () => handleRouteChange(window.location.pathname))

    return () => {
      // Rimuovi il listener quando il componente viene smontato
      window.removeEventListener('popstate', () => handleRouteChange(window.location.pathname))
    }
  }, [])

  return { push: customPush }
}

