import Navbar from './Navbar';
import LayoutHeader from './LayoutHeader';
import './styles/Layout.css';
import { useState } from 'react';

export default function Layout() {
  const [keyword, setKeyword] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const handleSearch = async (e, pageNum = 1) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(
        `/search?q=${encodeURIComponent(keyword)}&ll=${encodeURIComponent(coordinates)}&page=${pageNum}`,
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
      setPage(pageNum);
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
    setPage(1);
  };

  // Fetch all pages of results
  const fetchAllResults = async () => {
    let allResults = [];
    let pageNum = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `/search?q=${encodeURIComponent(keyword)}&ll=${encodeURIComponent(coordinates)}&page=${pageNum}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) break;
      const data = await response.json();

      if (Array.isArray(data.local_results) && data.local_results.length > 0) {
        allResults = allResults.concat(data.local_results);
        hasMore = data.local_results.length === 20;
        pageNum += 1;
      } else {
        hasMore = false;
      }
    }
    return allResults;
  };

  // Download all results as CSV
  const downloadAllCSV = async () => {
    setLoading(true);
    try {
      const allResults = await fetchAllResults();
      if (!allResults.length) {
        alert('No results to export.');
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

      const rows = allResults.map(item => ({
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
      link.setAttribute('download', 'all_results.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export all results.');
    } finally {
      setLoading(false);
    }
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
              <div>
                <button
                  className="download-button"
                  onClick={downloadAllCSV}
                  disabled={loading || !keyword || !coordinates}
                >
                  Download CSV
                </button>
              </div>
            </div>

            {loading && <p className="loading">🔄 Loading...</p>}
            {error && <p className="error">{error}</p>}
            {result && (
              <div>
                <div className="result-content">
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={() => handleSearch(null, page > 1 ? page - 1 : 1)}
                    disabled={loading || page === 1}
                  >
                    Previous
                  </button>
                  <span>Page {page}</span>
                  <button
                    onClick={() => handleSearch(null, page + 1)}
                    disabled={loading || !result.local_results || result.local_results.length < 20}
                  >
                    Next
                  </button>
                </div>
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
