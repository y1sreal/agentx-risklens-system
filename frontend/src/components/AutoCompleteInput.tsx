import React, { useState } from 'react';

interface AutoCompleteInputProps {
  label: string;
  value: string[];
  setValue: (v: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}

export const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
  label,
  value,
  setValue,
  suggestions,
  placeholder,
  className = ''
}) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filtered = suggestions.filter(s => 
    s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  const handleAdd = (newValue: string) => {
    if (newValue.trim() && !value.includes(newValue.trim())) {
      setValue([...value, newValue.trim()]);
      setInput('');
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((v, i) => (
          <span
            key={i}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              label.toLowerCase().includes('tech') ? 'bg-indigo-100 text-indigo-800' :
              label.toLowerCase().includes('purpose') ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}
          >
            {v}
            <button
              type="button"
              onClick={() => setValue(value.filter((_, idx) => idx !== i))}
              className={`ml-2 ${
                label.toLowerCase().includes('tech') ? 'text-indigo-600 hover:text-indigo-800' :
                label.toLowerCase().includes('purpose') ? 'text-green-600 hover:text-green-800' :
                'text-red-600 hover:text-red-800'
              }`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={placeholder || `Add ${label.toLowerCase()}...`}
          onKeyDown={e => {
            if (e.key === 'Enter' && input.trim()) {
              handleAdd(input.trim());
              e.preventDefault();
            }
          }}
        />
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filtered.map((s, i) => (
              <div
                key={i}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                onMouseDown={() => handleAdd(s)}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 