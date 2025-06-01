import React, { useState, useCallback } from 'react';

interface PrismRangeSliderProps {
    dimension: string;
    label: string;
    min?: number;
    max?: number;
    step?: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    disabled?: boolean;
}

export const PrismRangeSlider: React.FC<PrismRangeSliderProps> = ({
    dimension,
    label,
    min = 0,
    max = 1,
    step = 0.1,
    value,
    onChange,
    disabled = false
}) => {
    const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

    const handleMinChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = parseFloat(event.target.value);
        if (newMin <= value[1]) {
            onChange([newMin, value[1]]);
        }
    }, [value, onChange]);

    const handleMaxChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = parseFloat(event.target.value);
        if (newMax >= value[0]) {
            onChange([value[0], newMax]);
        }
    }, [value, onChange]);

    const getSliderBackground = () => {
        const minPercent = ((value[0] - min) / (max - min)) * 100;
        const maxPercent = ((value[1] - min) / (max - min)) * 100;
        
        return `linear-gradient(to right, 
            #E5E7EB 0%, 
            #E5E7EB ${minPercent}%, 
            #6366F1 ${minPercent}%, 
            #6366F1 ${maxPercent}%, 
            #E5E7EB ${maxPercent}%, 
            #E5E7EB 100%)`;
    };

    const reset = () => {
        onChange([min, max]);
    };

    const isDefault = value[0] === min && value[1] === max;

    return (
        <div className={`space-y-3 p-3 rounded-lg border ${disabled ? 'bg-gray-50 opacity-50' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                        {label}
                    </label>
                    {!isDefault && (
                        <button
                            onClick={reset}
                            className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                        >
                            Reset
                        </button>
                    )}
                </div>
                <div className="text-xs text-gray-500">
                    {Math.round(value[0] * 100)}% - {Math.round(value[1] * 100)}%
                </div>
            </div>

            {/* Custom Dual Range Slider */}
            <div className="relative">
                {/* Track */}
                <div 
                    className="h-2 rounded-full"
                    style={{ background: getSliderBackground() }}
                />

                {/* Min Slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value[0]}
                    onChange={handleMinChange}
                    onMouseDown={() => setIsDragging('min')}
                    onMouseUp={() => setIsDragging(null)}
                    disabled={disabled}
                    className="absolute top-0 left-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb-min"
                    style={{ 
                        background: 'transparent',
                        pointerEvents: isDragging === 'max' ? 'none' : 'auto'
                    }}
                />

                {/* Max Slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value[1]}
                    onChange={handleMaxChange}
                    onMouseDown={() => setIsDragging('max')}
                    onMouseUp={() => setIsDragging(null)}
                    disabled={disabled}
                    className="absolute top-0 left-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb-max"
                    style={{ 
                        background: 'transparent',
                        pointerEvents: isDragging === 'min' ? 'none' : 'auto'
                    }}
                />
            </div>

            {/* Value Labels */}
            <div className="flex justify-between text-xs text-gray-500">
                <span>Min: {Math.round(value[0] * 100)}%</span>
                <span>Max: {Math.round(value[1] * 100)}%</span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex gap-1">
                <button
                    onClick={() => onChange([0.8, 1.0])}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    disabled={disabled}
                >
                    High (80%+)
                </button>
                <button
                    onClick={() => onChange([0.6, 0.8])}
                    className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                    disabled={disabled}
                >
                    Med (60-80%)
                </button>
                <button
                    onClick={() => onChange([0, 0.6])}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    disabled={disabled}
                >
                    Low (&lt;60%)
                </button>
            </div>

            <style>{`
                .slider-thumb-min::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #6366F1;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    z-index: 2;
                }

                .slider-thumb-max::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #6366F1;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    z-index: 3;
                }

                .slider-thumb-min::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #6366F1;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    border: none;
                }

                .slider-thumb-max::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #6366F1;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    border: none;
                }
            `}</style>
        </div>
    );
}; 