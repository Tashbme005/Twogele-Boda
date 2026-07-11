import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getSpeechLang, LANGUAGES, LANGUAGE_NAMES, translate } from './translations'

const STORAGE_KEY = 'twogele-language'
const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return LANGUAGES.some((item) => item.id === saved) ? saved : 'en'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language)
    document.documentElement.lang = language === 'lg' ? 'lg' : language
  }, [language])

  const setLanguage = useCallback((next) => {
    if (!LANGUAGES.some((item) => item.id === next)) return
    setLanguageState(next)
  }, [])

  const t = useCallback((key, vars) => translate(language, key, vars), [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      languages: LANGUAGES,
      languageName: LANGUAGE_NAMES[language] || 'English',
      speechLang: getSpeechLang(language),
    }),
    [language, setLanguage, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
