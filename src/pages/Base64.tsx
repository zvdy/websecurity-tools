import React, { useState } from 'react';
import { encodeBase64, decodeBase64, encodeBase64Url, decodeBase64Url } from '../utils/crypto';
import { useTheme } from '../utils/ThemeContext';

const Base64: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [format, setFormat] = useState<'standard' | 'url'>('standard');
  const [error, setError] = useState<string | undefined>(undefined);
  const { darkMode } = useTheme();

  const handleProcess = () => {
    try {
      setError(undefined);
      
      if (!input.trim()) {
        setError('Please enter some text to process');
        setOutput('');
        return;
      }
      
      if (mode === 'encode') {
        if (format === 'standard') {
          setOutput(encodeBase64(input));
        } else {
          setOutput(encodeBase64Url(input));
        }
      } else {
        try {
          if (format === 'standard') {
            setOutput(decodeBase64(input));
          } else {
            setOutput(decodeBase64Url(input));
          }
        } catch (e) {
          setError(`Invalid Base64${format === 'url' ? ' URL' : ''} string`);
          setOutput('');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setOutput('');
    }
  };
  
  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(undefined);
  };

  const handleSwap = () => {
    setInput(output);
    setOutput('');
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setError(undefined);
  };

  return (
    <div className="container py-4 tool-container">
      <h1 className="mb-4">Base64 Encoder/Decoder</h1>
      <p className="text-muted mb-4">
        Encode data to Base64 or decode Base64 strings back to their original format.
      </p>

      <div className={`tool-section ${darkMode ? 'bg-dark' : 'bg-light'}`}>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label htmlFor="input" className="form-label mb-0">
              {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
            </label>
            <div className="btn-group btn-group-sm">
              <button
                className={`btn ${mode === 'encode' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setMode('encode')}
              >
                Encode
              </button>
              <button
                className={`btn ${mode === 'decode' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setMode('decode')}
              >
                Decode
              </button>
            </div>
          </div>
          <textarea
            id="input"
            className="form-control"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
          />
        </div>

        <div className="mb-3">
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="format"
              id="standardFormat"
              checked={format === 'standard'}
              onChange={() => setFormat('standard')}
            />
            <label className="form-check-label" htmlFor="standardFormat">
              Standard Base64
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="format"
              id="urlFormat"
              checked={format === 'url'}
              onChange={() => setFormat('url')}
            />
            <label className="form-check-label" htmlFor="urlFormat">
              Base64URL (URL and Filename safe)
            </label>
          </div>
        </div>
        
        <div className="d-flex gap-2 mb-3">
          <button 
            className="btn btn-primary"
            onClick={handleProcess}
          >
            {mode === 'encode' ? 'Encode' : 'Decode'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleClear}
          >
            Clear
          </button>
          {input && output && (
            <button 
              className="btn btn-info"
              onClick={handleSwap}
            >
              Swap & {mode === 'encode' ? 'Decode' : 'Encode'}
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {output && (
          <div className="mt-4">
            <h3>Result</h3>
            <div className={`${darkMode ? 'bg-black' : 'bg-dark'} text-white p-3 rounded`}>
              <pre className="text-break" style={{ margin: 0 }}>
                {output}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Base64;