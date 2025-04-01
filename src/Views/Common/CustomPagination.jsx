import { Box, Button, Select, MenuItem, Typography } from "@mui/material";

const CustomPagination = ({ page, perPage, total, setPage, setPerPage }) => {
  const totalPages = Math.ceil(total / perPage);

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePerPageChange = (event) => {
    const newPerPage = Number(event.target.value);
    setPerPage(newPerPage);
    setPage(1);
  };

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

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
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        borderTop: "1px solid #e0e0e0",
        backgroundColor: "#F6F4F4",
        width: "100% !important",
        borderRadius: "8px",
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 1, sm: 2 },
      }}
    >
      <Box
        sx={{
          display: { xs: "flex", sm: "none" },
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          order: 3,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: "12px",
            whiteSpace: "nowrap",
          }}
        >
          {start}-{end} of {total}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Select
            value={perPage}
            onChange={handlePerPageChange}
            size="small"
            sx={{
              height: "28px",
              fontSize: "12px",
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
              fontSize: "12px",
              whiteSpace: "nowrap",
            }}
          >
            Items per page
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: "12px", sm: "14px" },
          whiteSpace: "nowrap",
          display: { xs: "none", sm: "block" },
        }}
      >
        {start}-{end} of {total}
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", sm: "flex-start" },
          gap: { xs: 0.5, sm: 1 },
          width: { xs: "100%", sm: "auto" },
          order: { xs: 2, sm: 2 },
        }}
      >
        <Button
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
          sx={{
            minWidth: "30px",
            padding: "4px",
            fontSize: "14px",
          }}
        >
          {"<<"}
        </Button>

        <Button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          sx={{
            minWidth: { xs: "32px", sm: "30px" },
            padding: { xs: "4px", sm: "4px" },
            fontSize: { xs: "16px", sm: "14px" },
          }}
        >
          {"<"}
        </Button>

        {getPageNumbers().map((pageNumber) => (
          <Button
            key={`desktop-${pageNumber}`}
            onClick={() => handlePageChange(pageNumber)}
            sx={{
              minWidth: "30px",
              padding: "4px",
              fontSize: "14px",
              backgroundColor:
                page === pageNumber ? "var(--primary-color)" : "transparent",
              color: page === pageNumber ? "#fff" : "#000",
              "&:hover": {
                backgroundColor:
                  page === pageNumber ? "var(--primary-color)" : "#e0e0e0",
              },
            }}
          >
            {pageNumber}
          </Button>
        ))}

        {/* Next page */}
        <Button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          sx={{
            minWidth: { xs: "32px", sm: "30px" },
            padding: { xs: "4px", sm: "4px" },
            fontSize: { xs: "16px", sm: "14px" },
          }}
        >
          {">"}
        </Button>

        {/* Last page - desktop only */}
        <Button
          onClick={() => handlePageChange(totalPages)}
          disabled={page === totalPages}
          sx={{
            minWidth: "30px",
            padding: "4px",
            fontSize: "14px",
          }}
        >
          {">>"}
        </Button>
      </Box>

      {/* Desktop view: Items per page dropdown - right */}
      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
          order: { sm: 3 },
        }}
      >
        <Select
          value={perPage}
          onChange={handlePerPageChange}
          size="small"
          sx={{
            height: "32px",
            fontSize: "14px",
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
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          Items per page
        </Typography>
      </Box>
    </Box>
  );
};

export default CustomPagination;
