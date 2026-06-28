import { useState, useEffect } from 'react';
import { Box, Typography, Card, TextField, InputAdornment, Chip, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';

// 1. IMPORT API FUNCTION, REMOVE MOCK DATA
import { getAllFines } from '../services/api';

export default function Transactions() {
  const [searchText, setSearchText] = useState('');
  
  // 2. ADD STATE FOR LIVE DATA AND LOADING INDICATOR
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. FETCH DATA ON COMPONENT MOUNT
  useEffect(() => {
    const fetchFines = async () => {
      try {
        setLoading(true);
        const data = await getAllFines();
        setFines(data || []);
      } catch (error) {
        console.error('Failed to load transactions:', error);
        setFines([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFines();
  }, []);

  // 4. BULLETPROOF SEARCH LOGIC (Handles potential nulls from the database)
  const filteredRows = fines.filter((row) => {
    const searchLower = searchText.toLowerCase();
    return (
      (row.referenceNumber || '').toLowerCase().includes(searchLower) ||
      (row.categoryName || '').toLowerCase().includes(searchLower) ||
      (row.district || '').toLowerCase().includes(searchLower)
    );
  });

  // ─── Table Column Definitions ───
  const columns = [
    { field: 'referenceNumber', headerName: 'Reference No.', flex: 1, minWidth: 140 },
    // Format the date string coming from the backend
    { 
      field: 'issuedAt', // Adjust to match your backend's date field name (e.g., 'dateIssued' or 'issuedAt')
      headerName: 'Date Issued', 
      flex: 1, 
      minWidth: 160,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString() : 'N/A'}
        </Typography>
      )
    },
    { field: 'categoryName', headerName: 'Violation Type', flex: 1.5, minWidth: 200 },
    { field: 'district', headerName: 'District', flex: 1, minWidth: 120 },
    { 
      field: 'amount', 
      headerName: 'Amount (LKR)', 
      flex: 1, 
      minWidth: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="500">
          Rs. {Number(params.value || 0).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const status = params.value || 'UNKNOWN';
        const isPaid = status.toUpperCase() === 'PAID';
        return (
          <Chip 
            label={status} 
            size="small" 
            color={isPaid ? 'success' : 'error'} 
            variant={isPaid ? 'filled' : 'outlined'}
            sx={{ fontWeight: 'bold', borderRadius: 1 }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      minWidth: 80,
      sortable: false,
      filterable: false,
      renderCell: () => (
        <Tooltip title="View Details">
          <IconButton color="primary" size="small">
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
      
      {/* Page Header & Search Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Transactions Ledger</Typography>
        <TextField
          placeholder="Search by reference, violation, or district..."
          variant="outlined"
          size="small"
          sx={{ width: { xs: '100%', sm: 350 }, backgroundColor: 'white', borderRadius: 1 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* DataGrid Table */}
      <Card elevation={2} sx={{ flexGrow: 1, height: 'calc(100vh - 180px)' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          // Safely grab the ID, defaulting to referenceNumber if backend ID is missing
          getRowId={(row) => row.id || row.referenceNumber} 
          disableRowSelectionOnClick
          loading={loading} // Automatically shows MUI's native loading overlay
          initialState={{
            pagination: {
              paginationModel: { pageSize: 15, page: 0 },
            },
          }}
          pageSizeOptions={[15, 30, 50]}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': { outline: 'none' }, 
            '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
            '& .MuiDataGrid-columnHeaders': { 
              backgroundColor: '#f8fafc', 
              borderBottom: '2px solid #e2e8f0',
              textTransform: 'uppercase',
              fontSize: '0.85rem'
            },
          }}
        />
      </Card>
    </Box>
  );
}