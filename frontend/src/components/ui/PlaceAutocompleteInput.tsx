import { useState, useEffect } from 'react'
import { searchPlaces, type PlaceSuggestion, type LocationBias } from '../../services/placeSearchService'

interface PlaceAutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  onSelect: (suggestion: PlaceSuggestion) => void
  placeholder: string
  className: string
  wrapperClassName?: string
  required?: boolean
  near?: LocationBias
}

export default function PlaceAutocompleteInput({
  value, onChange, onSelect, placeholder, className, wrapperClassName = 'relative', required, near,
}: PlaceAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (!showSuggestions) return
    const timer = setTimeout(() => {
      searchPlaces(value, near).then(setSuggestions).catch(() => setSuggestions([]))
    }, 400)
    return () => clearTimeout(timer)
  }, [value, showSuggestions, near])

  function handleSelect(suggestion: PlaceSuggestion) {
    onSelect(suggestion)
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className={wrapperClassName}>
      <input
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowSuggestions(true) }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        className={className}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-foreground/15 shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={() => handleSelect(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/10 transition-colors"
              >
                <span className="text-foreground">{s.name}</span>
                {s.label !== s.name && <span className="block text-xs text-foreground/50">{s.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
