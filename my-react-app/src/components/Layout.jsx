import Navbar from './Navbar';
import LayoutHeader from './LayoutHeader';
import './styles/Layout.css';
import { useState } from 'react';

export default function Layout() {
  const [keyword, setKeyword] = useState('');
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
        `http://localhost:5000/search?q=${encodeURIComponent(keyword)}`
      );

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('❌ Failed to fetch results');
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
        name="q"
        value={keyword}
        placeholder="Enter keyword"
        onChange={(e) => setKeyword(e.target.value)}
        required
      />
      <div className="button-group">
        <button type="submit">Search</button>
        <button
          type="reset"
          onClick={() => {
            setKeyword('');
            setResult(null);
            setError(null);
          }}
        >
          Reset
        </button>
      </div>
    </form>

    <div className="result-box"> <h3>Output</h3>
      {loading && <p>🔄 Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
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
