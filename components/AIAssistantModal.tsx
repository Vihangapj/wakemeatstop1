import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { LatLngTuple } from '../types';
import IconSparkles from './icons/IconSparkles';

interface FindDestinationModalProps {
  onClose: () => void;
  onDestinationFound: (position: LatLngTuple) => void;
}

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        latitude: {
            type: Type.NUMBER,
            description: 'The latitude of the location.',
        },
        longitude: {
            type: Type.NUMBER,
            description: 'The longitude of the location.',
        },
    },
    required: ['latitude', 'longitude'],
};


const FindDestinationModal: React.FC<FindDestinationModalProps> = ({ onClose, onDestinationFound }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFind = async () => {
    if (!query.trim()) {
      setError('Please enter a destination.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Find the precise geographic coordinates (latitude and longitude) for the following user-described location: "${query}"`,
          config: {
              responseMimeType: 'application/json',
              responseSchema: responseSchema,
          }
      });
      
      const jsonText = response.text.trim();
      const result = JSON.parse(jsonText);

      if (result.latitude && result.longitude) {
        onDestinationFound([result.latitude, result.longitude]);
      } else {
        throw new Error('Invalid coordinates received from AI.');
      }

    } catch (e: any) {
      console.error("Destination Finder Error:", e);
      setError('Could not find destination. Please try a different or more specific query.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="flex items-center gap-3 text-xl font-bold text-white">
            <IconSparkles className="w-6 h-6 text-teal-400"/>
            Find Destination
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-6">
          <p className="text-gray-300 mb-4 text-sm">Describe your destination, and we'll find it on the map.</p>
          <div className="space-y-4">
             <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleFind()}
                placeholder='e.g., "Eiffel Tower" or "123 Main St, Anytown"'
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
                disabled={isLoading}
             />
             {error && <p className="text-red-400 text-sm text-center">{error}</p>}
             <button
                onClick={handleFind}
                disabled={isLoading}
                className="w-full flex justify-center items-center bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-wait"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                    </>
                ) : 'Find on Map'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindDestinationModal;