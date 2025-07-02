import Navbar from './Navbar';
import LayoutHeader from './LayoutHeader';
import './styles/Layout.css';
import useLayoutLogic from './useLayoutLogic';

export default function Layout() {
  const {
    keyword, setKeyword,
    coordinates, setCoordinates,
    result,
    loading,
    error,
    page,
    totalPages,
    resultsPerPage,
    totalPagesLoading,
    dbPopup,
    handleSearch,
    handleReset,
    downloadAllCSV
  } = useLayoutLogic();

  return (
    <div className="page-layout">
      <Navbar />
      <LayoutHeader />

      {/*Popup*/}

      {dbPopup.open && (
        <div className="db-popup-backdrop">
          <div className="db-popup-content">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
              {dbPopup.message === 'Saved to database!' ? (

                // Popup - Green tick code
                
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="12" fill="#d1fae5"/>
                  <path d="M7 13.5L11 17L17 9.5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (

                // Popup - Spinner code
                
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 38 38"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ display: 'block', margin: '0 auto' }}
                >
                  <g transform="translate(1 1)" strokeWidth="3" fill="none" fillRule="evenodd">
                    <circle stroke="#c7d2fe" strokeOpacity=".5" cx="18" cy="18" r="18"/>
                    <path d="M36 18c0-9.94-8.06-18-18-18" stroke="#2563eb">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 18 18"
                        to="360 18 18"
                        dur="0.8s"
                        repeatCount="indefinite"
                      />
                    </path>
                  </g>
                </svg>
              )}
            </div>
            <h2 className="db-popup-title">{dbPopup.message}</h2>
          </div>
        </div>
      )}

      {/* Search Box */}

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

            {/* Buttons in Search box */}

            <div className="button-group">
              <button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button type="reset" onClick={handleReset} disabled={loading}>
                Reset
              </button>
            </div>
          </form>

          {/* Result box */}

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

      {/* footer Section */}

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