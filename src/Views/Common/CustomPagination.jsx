import { Box, Button, Select, MenuItem, Typography } from '@mui/material';

const CustomPagination = ({ page, perPage, total, setPage, setPerPage }) => {
  const totalPages = Math.ceil(total / perPage);

  // Calculate the range of items being displayed
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Handle items per page change
  const handlePerPageChange = (event) => {
    const newPerPage = Number(event.target.value);
    setPerPage(newPerPage);
    setPage(1); // Reset to first page when changing items per page
  };

  // Generate page numbers to display (e.g., 1, 2, 3, 4, 5)
  const getPageNumbers = () => {
    const maxPagesToShow = 5; // Show up to 5 page numbers
    const pages = [];
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#F6F4F4',
        width: '100% !important',
        borderRadius: '8px',
        // Responsive adjustments
        flexDirection: { xs: 'row', sm: 'row' }, // Keep it in a row for all screen sizes
        flexWrap: 'wrap', // Allow wrapping if needed
        gap: { xs: 1, sm: 2 }, // Smaller gap on mobile
      }}
    >
      {/* Left: Display range (e.g., 1-10 of 2083) */}
      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: '12px', sm: '14px' }, // Smaller font on mobile
          whiteSpace: 'nowrap', // Prevent text wrapping
        }}
      >
        {start}-{end} of {total}
      </Typography>

      {/* Center: Pagination controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.5, sm: 1 }, // Smaller gap between buttons on mobile
          flexShrink: 0, // Prevent shrinking
        }}
      >
        {/* First page button */}
        <Button
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
          sx={{
            minWidth: { xs: '24px', sm: '30px' }, // Smaller buttons on mobile
            padding: { xs: '2px', sm: '4px' },
            fontSize: { xs: '12px', sm: '14px' },
          }}
        >
          {'<<'}
        </Button>

        {/* Previous page button */}
        <Button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          sx={{
            minWidth: { xs: '24px', sm: '30px' },
            padding: { xs: '2px', sm: '4px' },
            fontSize: { xs: '12px', sm: '14px' },
          }}
        >
          {'<'}
        </Button>

        {/* Page numbers */}
        {getPageNumbers().map((pageNumber) => (
          <Button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            sx={{
              minWidth: { xs: '24px', sm: '30px' },
              padding: { xs: '2px', sm: '4px' },
              fontSize: { xs: '12px', sm: '14px' },
              backgroundColor: page === pageNumber ? 'var(--primary-color)' : 'transparent',
              color: page === pageNumber ? '#fff' : '#000',
              '&:hover': {
                backgroundColor: page === pageNumber ? 'var(--primary-color)' : '#e0e0e0',
              },
            }}
          >
            {pageNumber}
          </Button>
        ))}

        {/* Next page button */}
        <Button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          sx={{
            minWidth: { xs: '24px', sm: '30px' },
            padding: { xs: '2px', sm: '4px' },
            fontSize: { xs: '12px', sm: '14px' },
          }}
        >
          {'>'}
        </Button>

        {/* Last page button */}
        <Button
          onClick={() => handlePageChange(totalPages)}
          disabled={page === totalPages}
          sx={{
            minWidth: { xs: '24px', sm: '30px' },
            padding: { xs: '2px', sm: '4px' },
            fontSize: { xs: '12px', sm: '14px' },
          }}
        >
          {'>>'}
        </Button>
      </Box>

      {/* Right: Items per page dropdown */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.5, sm: 1 }, // Smaller gap on mobile
          flexShrink: 0, // Prevent shrinking
        }}
      >
        <Select
          value={perPage}
          onChange={handlePerPageChange}
          size="small"
          sx={{
            height: { xs: '28px', sm: '32px' }, // Smaller dropdown on mobile
            fontSize: { xs: '12px', sm: '14px' },
          }}
        >
          {[10, 20, 50, 100].map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: '12px', sm: '14px' },
            whiteSpace: 'nowrap',
          }}
        >
          Items per page
        </Typography>
      </Box>
    </Box>
  );
};

export default CustomPagination;