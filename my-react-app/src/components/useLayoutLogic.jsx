import { useState } from 'react';

export default function useLayoutLogic() {
  const [keyword, setKeyword] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [resultsPerPage, setResultsPerPage] = useState(0);
  const [totalPagesLoading, setTotalPagesLoading] = useState(false);
  const [dbPopup, setDbPopup] = useState({ open: false, message: '' });

  //To find total pages

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

  //Search button logic

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
      setError(`❌ Failed to fetch results: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  //Reset button logic

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

  //Find all paginated results

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

  //Download fetched results as csv and send to backend api

  const downloadAllCSV = async () => {
    setLoading(true);
    setDbPopup({ open: true, message: 'Saving to database...' });
    try {
      const allResults = await fetchAllResults();
      if (!allResults.length) {
        setDbPopup({ open: true, message: 'No results to export.' });
        setTimeout(() => setDbPopup({ open: false, message: '' }), 1500);
        setLoading(false);
        return;
      }

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

        let serviceOptions = getFromExtensions('service_options');
        if (!serviceOptions && typeof item.service_options === 'object' && item.service_options !== null) {
          serviceOptions = Object.entries(item.service_options).map(([k, v]) => `${k}: ${v}`).join('; ');
        }

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
      link.setAttribute('download', 'results.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Save to Database 

      const mappedResults = allResults.map(item => {
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

        let serviceOptions = getFromExtensions('service_options');
        if (!serviceOptions && typeof item.service_options === 'object' && item.service_options !== null) {
          serviceOptions = Object.entries(item.service_options).map(([k, v]) => `${k}: ${v}`).join('; ');
        }

        let reserveTable = item.reserve_a_table || '';
        const planning = getFromExtensions('planning');
        if (planning) {
          reserveTable = reserveTable
            ? `${reserveTable}; ${planning}`
            : planning;
        }

        return {
          title: item.title || '',
          latitude_and_longitude: item.gps_coordinates
            ? `${item.gps_coordinates.latitude || ''},${item.gps_coordinates.longitude || ''}`
            : '',
          ratings: item.rating || '',
          review: item.reviews || '',
          type: item.type || '',
          types: Array.isArray(item.types) ? item.types.join('; ') : (item.types || ''),
          type_id: item.type_id || '',
          address: item.address || '',
          operating_hours: item.hours
            ? (typeof item.hours === 'string'
                ? item.hours
                : (item.hours.displayed_hours || []).join('; '))
            : '',
          phone: item.phone || '',
          website: item.website || '',
          service_options: serviceOptions,
          popular_for: getFromExtensions('popular_for') || (Array.isArray(item.popular_for) ? item.popular_for.join('; ') : (item.popular_for || '')),
          highlights: getFromExtensions('highlights') || (Array.isArray(item.highlights) ? item.highlights.join('; ') : (item.highlights || '')),
          offerings: getFromExtensions('offerings') || (Array.isArray(item.offerings) ? item.offerings.join('; ') : (item.offerings || '')),
          dining_options: getFromExtensions('dining_options') || (Array.isArray(item.dining_options) ? item.dining_options.join('; ') : (item.dining_options || '')),
          amenities: getFromExtensions('amenities') || (Array.isArray(item.amenities) ? item.amenities.join('; ') : (item.amenities || '')),
          atmosphere: getFromExtensions('atmosphere') || (Array.isArray(item.atmosphere) ? item.atmosphere.join('; ') : (item.atmosphere || '')),
          crowd: getFromExtensions('crowd') || (Array.isArray(item.crowd) ? item.crowd.join('; ') : (item.crowd || '')),
          payments: getFromExtensions('payments') || (Array.isArray(item.payments) ? item.payments.join('; ') : (item.payments || '')),
          parking: getFromExtensions('parking') || (Array.isArray(item.parking) ? item.parking.join('; ') : (item.parking || '')),
          pets: getFromExtensions('pets') || (Array.isArray(item.pets) ? item.pets.join('; ') : (item.pets || '')),
          reserve_a_table: reserveTable,
          order_online: item.order_online || ''
        };
      });

      const response = await fetch('http://localhost:7000/api/results/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappedResults),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setDbPopup({ open: true, message: 'Error saving to database!' });
        setTimeout(() => setDbPopup({ open: false, message: '' }), 1500);
        setLoading(false);
        throw new Error(`Failed to save results: ${errorText}`);
      }

    //   Popup - database saved successfully

      setDbPopup({ open: true, message: 'Saved to database!' });
      setTimeout(() => setDbPopup({ open: false, message: '' }), 1500);
    } catch (err) {
      setDbPopup({ open: true, message: 'Error saving to database!' });
      setTimeout(() => setDbPopup({ open: false, message: '' }), 1500);
    } finally {
      setLoading(false);
    }
  };

  // export logic

  return {
    keyword, setKeyword,
    coordinates, setCoordinates,
    result, setResult,
    loading, setLoading,
    error, setError,
    page, setPage,
    totalPages, setTotalPages,
    resultsPerPage, setResultsPerPage,
    totalPagesLoading, setTotalPagesLoading,
    dbPopup, setDbPopup,
    handleSearch,
    handleReset,
    downloadAllCSV
  };
}