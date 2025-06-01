import React, { useState } from 'react';

interface IndexEditModalProps {
  initialTechnologies: string[];
  initialPurposes: string[];
  initialEthicalIssues: string[];
  techSuggestions: string[];
  purposeSuggestions: string[];
  ethicalSuggestions: string[];
  onSave: (tech: string[], purpose: string[], ethical: string[]) => void;
  onClose: () => void;
}

const AutoCompleteInput: React.FC<{
  label: string;
  value: string[];
  setValue: (v: string[]) => void;
  suggestions: string[];
}> = ({ label, value, setValue, suggestions }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filtered = suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s));

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 mb-1">
        {value.map((v, i) => (
          <span key={i} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs flex items-center">
            {v}
            <button type="button" className="ml-1 text-indigo-600 hover:text-indigo-900" onClick={() => setValue(value.filter((_, idx) => idx !== i))}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder={`Add ${label.toLowerCase()}...`}
        onKeyDown={e => {
          if (e.key === 'Enter' && input.trim()) {
            if (!value.includes(input.trim())) setValue([...value, input.trim()]);
            setInput('');
            setShowSuggestions(false);
            e.preventDefault();
          }
        }}
      />
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-32 overflow-y-auto">
          {filtered.map((s, i) => (
            <div
              key={i}
              className="px-3 py-2 hover:bg-indigo-100 cursor-pointer"
              onMouseDown={() => {
                setValue([...value, s]);
                setInput('');
                setShowSuggestions(false);
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const IndexEditModal: React.FC<IndexEditModalProps> = ({
  initialTechnologies,
  initialPurposes,
  initialEthicalIssues,
  techSuggestions,
  purposeSuggestions,
  ethicalSuggestions,
  onSave,
  onClose
}) => {
  const [tech, setTech] = useState<string[]>(initialTechnologies);
  const [purpose, setPurpose] = useState<string[]>(initialPurposes);
  const [ethical, setEthical] = useState<string[]>(initialEthicalIssues);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <span className="sr-only">Close</span>
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Predicted Indices</h2>
        <AutoCompleteInput label="Technologies" value={tech} setValue={setTech} suggestions={techSuggestions} />
        <AutoCompleteInput label="Purposes" value={purpose} setValue={setPurpose} suggestions={purposeSuggestions} />
        <AutoCompleteInput label="Ethical Issues" value={ethical} setValue={setEthical} suggestions={ethicalSuggestions} />
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={() => onSave(tech, purpose, ethical)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save & Continue</button>
        </div>
      </div>
    </div>
  );
}; 