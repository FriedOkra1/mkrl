import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default to local backend if env var is not set
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortCode('');

    try {
      const response = await axios.post(`${API_BASE_URL}/shorten`, {
        long_url: longUrl,
      });
      setShortCode(response.data.short_code);
    } catch (err) {
      console.error(err);
      setError('Failed to shorten URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fullShortUrl = shortCode ? `${API_BASE_URL}/${shortCode}` : '';

  return (
    <div className="container">
      <h1>mkrl TinyURL</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            placeholder="Enter long URL here..."
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            required
            className="input-field"
          />
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {shortCode && (
          <div className="result">
            <p>Your shortened URL:</p>
            <div className="url-box">
              <a href={fullShortUrl} target="_blank" rel="noopener noreferrer">
                {fullShortUrl}
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(fullShortUrl)}
                className="copy-btn"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
