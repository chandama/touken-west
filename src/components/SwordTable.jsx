import React, { useState } from 'react';

/**
 * SwordTable component for displaying sword data in a table with pagination and sorting
 */
const SwordTable = ({ swords, onSwordSelect, selectedSword }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('Index');
  const [sortDirection, setSortDirection] = useState('asc');
  const itemsPerPage = 50;

  // Sort the swords before pagination
  const sortedSwords = React.useMemo(() => {
    const sorted = [...swords];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle numeric fields
      if (sortField === 'Index' || sortField === 'Nagasa') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else {
        // Convert to string for text comparison
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [swords, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedSwords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSwords = sortedSwords.slice(startIndex, endIndex);

  const handleRowClick = (sword) => {
    onSwordSelect(sword);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const getSortIndicator = (field) => {
    if (sortField !== field) return ' ⇅';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageJump = (page) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when sword list changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [swords.length]);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (swords.length === 0) {
    return <div className="no-results">No swords found matching your criteria.</div>;
  }

  return (
    <div className="sword-table-container">
      <table className="sword-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('Index')} className="sortable">
              Index{getSortIndicator('Index')}
            </th>
            <th onClick={() => handleSort('Type')} className="sortable">
              Type{getSortIndicator('Type')}
            </th>
            <th onClick={() => handleSort('School')} className="sortable">
              School{getSortIndicator('School')}
            </th>
            <th onClick={() => handleSort('Smith')} className="sortable">
              Smith{getSortIndicator('Smith')}
            </th>
            <th onClick={() => handleSort('Mei')} className="sortable">
              Mei{getSortIndicator('Mei')}
            </th>
            <th onClick={() => handleSort('Nagasa')} className="sortable">
              Length (cm){getSortIndicator('Nagasa')}
            </th>
            <th onClick={() => handleSort('Period')} className="sortable">
              Period{getSortIndicator('Period')}
            </th>
            <th onClick={() => handleSort('Province')} className="sortable">
              Province{getSortIndicator('Province')}
            </th>
            <th onClick={() => handleSort('Authentication')} className="sortable">
              Authentication{getSortIndicator('Authentication')}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentSwords.map((sword) => (
            <tr
              key={sword.Index}
              onClick={() => handleRowClick(sword)}
              className={selectedSword?.Index === sword.Index ? 'selected' : ''}
            >
              <td>{sword.Index}</td>
              <td>{sword.Type}</td>
              <td>{sword.School}</td>
              <td>{sword.Smith}</td>
              <td className="mei-cell">{sword.Mei}</td>
              <td>{sword.Nagasa}</td>
              <td>{sword.Period}</td>
              <td>{sword.Province}</td>
              <td className="auth-cell">{sword.Authentication}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="page-button"
          >
            Previous
          </button>

          <div className="page-numbers">
            {currentPage > 3 && (
              <>
                <button onClick={() => handlePageJump(1)} className="page-number">
                  1
                </button>
                {currentPage > 4 && <span className="ellipsis">...</span>}
              </>
            )}

            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => handlePageJump(page)}
                className={`page-number ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}

            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="ellipsis">...</span>}
                <button onClick={() => handlePageJump(totalPages)} className="page-number">
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="page-button"
          >
            Next
          </button>
        </div>
      )}

      <div className="pagination-info">
        Page {currentPage} of {totalPages} ({startIndex + 1}-{Math.min(endIndex, swords.length)} of {swords.length})
      </div>
    </div>
  );
};

export default SwordTable;
