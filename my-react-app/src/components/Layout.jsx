import Navbar from './Navbar';
import LayoutHeader from './LayoutHeader';
import './styles/Layout.css';
import { useState, useRef } from 'react';

export default function Layout() {
  const [keyword, setKeyword] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(
        `/search?q=${encodeURIComponent(keyword)}&ll=${encodeURIComponent(coordinates)}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(`❌ Failed to fetch results: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setKeyword('');
    setCoordinates('');
    setResult(null);
    setError(null);
  };

  const downloadCSV = () => {
    if (!result || !Array.isArray(result.local_results)) {
      alert("No valid data to export.");
      return;
    }

    const headers = [
      'title',
      'rating',
      'reviews',
      'type',
      'type_id',
      'address',
      'phone number',
      'website',
      'order_online'
    ];

    const rows = result.local_results.map(item => ({
      title: item.title || '',
      rating: item.rating || '',
      reviews: item.reviews || '',
      type: item.type || '',
      type_id: item.type_id || '',
      address: item.address || '',
      'phone number': item.phone || '',
      website: item.website || '',
      order_online: item.order_online || ''
    }));

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        headers.map(field => `"${(row[field] || '').toString().replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'output.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-layout">
      <Navbar />
      <LayoutHeader />

      <div className="content-area">
        <div className="columns">
          <form onSubmit={handleSearch}>
            <label htmlFor="search-box">Enter Keyword</label>
            <input
              type="text"
              id="search-box"
              name="keyword"
              value={keyword}
              placeholder="Enter keyword"
              onChange={(e) => setKeyword(e.target.value)}
              required
            />

            <label htmlFor="search-box-coordinates">Enter Coordinates</label>
            <input
              type="text"
              id="search-box-coordinates"
              name="coordinates"
              value={coordinates}
              placeholder="Enter Coordinates (e.g., 37.7749,-122.4194)"
              onChange={(e) => setCoordinates(e.target.value)}
            />

            <div className="button-group">
              <button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button type="reset" onClick={handleReset} disabled={loading}>
                Reset
              </button>
            </div>
          </form>

          <div className="result-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Output</h3>
              <button 
                className="download-button"
                onClick={downloadCSV}
                disabled={!result || !Array.isArray(result.local_results)}
              >
                Download CSV
              </button>
            </div>

            {loading && <p className="loading">🔄 Loading...</p>}
            {error && <p className="error">{error}</p>}
            {result && (
              <div className="result-content">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-left">2025©Keenthemes</div>
        <div className="footer-right">
          <a href="#">About</a>
          <a href="#">Support</a>
          <a href="#">Purchase</a>
        </div>
      </footer>
    </div>
  );
}
