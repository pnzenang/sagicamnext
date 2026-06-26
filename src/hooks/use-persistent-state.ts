'use client'

import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react'

export function usePersistentState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const initialValueRef = useRef(initialValue)
  const [state, setState] = useState<T>(initialValue)
  const [hasLoadedPersistedState, setHasLoadedPersistedState] = useState(false)

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(key)

      if (rawValue !== null) {
        setState(JSON.parse(rawValue) as T)
      }
    } catch {
      setState(initialValueRef.current)
    } finally {
      setHasLoadedPersistedState(true)
    }
  }, [key])

  useEffect(() => {
    if (!hasLoadedPersistedState) return

    try {
      const serializedValue = JSON.stringify(state)

      if (typeof serializedValue === 'string') {
        window.localStorage.setItem(key, serializedValue)
      }
    } catch {
      // Ignore storage errors so table filters keep working in private/restricted browsers.
    }
  }, [hasLoadedPersistedState, key, state])

  return [state, setState]
}
