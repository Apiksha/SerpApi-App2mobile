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
  const [totalPages, setTotalPages] = useState(null);
  const [resultsPerPage, setResultsPerPage] = useState(0);
  const [totalPagesLoading, setTotalPagesLoading] = useState(false);

  //find total pages received from SerpAPI

  const updateTotalPages = async () => {
    setTotalPagesLoading(true);
    let pageNum = 1;
    let hasMore = true;
    let totalPagesFetched = 0;

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
        hasMore = data.local_results.length === 20;
        pageNum += 1;
        totalPagesFetched += 1;
      } else {
        hasMore = false;
      }
    }
    setTotalPages(totalPagesFetched);
    setTotalPagesLoading(false);
  };

  //Search Button Logic

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

      setResultsPerPage(Array.isArray(data.local_results) ? data.local_results.length : 0);

      const totalResults = data.search_information?.total_results || 0;
      const pages = totalResults > 0 ? Math.ceil(totalResults / 20) : 1;
      setTotalPages(pages);

      if (pages === 1 && Array.isArray(data.local_results) && data.local_results.length === 20) {
        updateTotalPages();
      }
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
    setTotalPages(0);
    setResultsPerPage(0);
    setTotalPagesLoading(false);
  };

  const fetchAllResults = async () => {
    let allResults = [];
    let pageNum = 1;
    let hasMore = true;
    let lastPageResults = 0;
    let totalPagesFetched = 0;

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
        lastPageResults = data.local_results.length;
        hasMore = data.local_results.length === 20;
        pageNum += 1;
        totalPagesFetched += 1;
      } else {
        hasMore = false;
      }
    }
    setResultsPerPage(lastPageResults);
    setTotalPages(totalPagesFetched);
    return allResults;
  };

  // Download csv Logic
  
  const downloadAllCSV = async () => {
    setLoading(true);
    try {
      const allResults = await fetchAllResults();
      if (!allResults.length) {
        alert('No results to export.');
        return;
      }

      // Updated headers as per your requirements
      const headers = [
        'title',
        'latitude and longitude',
        'ratings',
        'review',
        'type',
        'types',
        'type_id',
        'address',
        'operating hours',
        'phone',
        'website',
        'service options',
        'popular_for',
        'highlights',
        'offerings',
        'dining options',
        'amenities',
        'atmosphere',
        'crowd',
        'payments',
        'parking',
        'pets',
        'reserve a table',
        'order online'
      ];

      const rows = allResults.map(item => {
        // Helper to extract array/object field from extensions
        const getFromExtensions = (field) => {
          if (!Array.isArray(item.extensions)) return '';
          for (const ext of item.extensions) {
            if (ext[field]) {
              if (Array.isArray(ext[field])) return ext[field].join('; ');
              if (typeof ext[field] === 'object') return Object.entries(ext[field]).map(([k, v]) => `${k}: ${v}`).join('; ');
              return ext[field];
            }
          }
          return '';
        };

        // Service options: prefer array from extensions, else object from top-level
        let serviceOptions = getFromExtensions('service_options');
        if (!serviceOptions && typeof item.service_options === 'object' && item.service_options !== null) {
          serviceOptions = Object.entries(item.service_options).map(([k, v]) => `${k}: ${v}`).join('; ');
        }

        // Reserve a table: combine reserve_a_table, planning from extensions, and any other info
        let reserveTable = item.reserve_a_table || '';
        const planning = getFromExtensions('planning');
        if (planning) {
          reserveTable = reserveTable
            ? `${reserveTable}; ${planning}`
            : planning;
        }

        return {
          title: item.title || '',
          'latitude and longitude': item.gps_coordinates
            ? `${item.gps_coordinates.latitude || ''},${item.gps_coordinates.longitude || ''}`
            : '',
          ratings: item.rating || '',
          review: item.reviews || '',
          type: item.type || '',
          types: Array.isArray(item.types) ? item.types.join('; ') : (item.types || ''),
          type_id: item.type_id || '',
          address: item.address || '',
          'operating hours': item.hours
            ? (typeof item.hours === 'string'
                ? item.hours
                : (item.hours.displayed_hours || []).join('; '))
            : '',
          phone: item.phone || '',
          website: item.website || '',
          'service options': serviceOptions,
          popular_for: getFromExtensions('popular_for') || (Array.isArray(item.popular_for) ? item.popular_for.join('; ') : (item.popular_for || '')),
          highlights: getFromExtensions('highlights') || (Array.isArray(item.highlights) ? item.highlights.join('; ') : (item.highlights || '')),
          offerings: getFromExtensions('offerings') || (Array.isArray(item.offerings) ? item.offerings.join('; ') : (item.offerings || '')),
          'dining options': getFromExtensions('dining_options') || (Array.isArray(item.dining_options) ? item.dining_options.join('; ') : (item.dining_options || '')),
          amenities: getFromExtensions('amenities') || (Array.isArray(item.amenities) ? item.amenities.join('; ') : (item.amenities || '')),
          atmosphere: getFromExtensions('atmosphere') || (Array.isArray(item.atmosphere) ? item.atmosphere.join('; ') : (item.atmosphere || '')),
          crowd: getFromExtensions('crowd') || (Array.isArray(item.crowd) ? item.crowd.join('; ') : (item.crowd || '')),
          payments: getFromExtensions('payments') || (Array.isArray(item.payments) ? item.payments.join('; ') : (item.payments || '')),
          parking: getFromExtensions('parking') || (Array.isArray(item.parking) ? item.parking.join('; ') : (item.parking || '')),
          pets: getFromExtensions('pets') || (Array.isArray(item.pets) ? item.pets.join('; ') : (item.pets || '')),
          'reserve a table': reserveTable,
          'order online': item.order_online || ''
        };
      });

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

            {totalPagesLoading ? (
              <div style={{ marginBottom: '17px', fontWeight: 500 }}>
                Total Pages: <span className="loading">🔄...</span> | Results per Page: {resultsPerPage}
              </div>
            ) : (
              (totalPages !== null && (totalPages > 0 || resultsPerPage > 0)) && (
                <div style={{ marginBottom: '10px', fontWeight: 500 }}>
                  Total Pages: {totalPages} | Results per Page: {resultsPerPage}
                </div>
              )
            )}

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
