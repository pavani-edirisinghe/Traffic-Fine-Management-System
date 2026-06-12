import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Grid, Snackbar, Alert, Divider, Stack, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { createOfficer, deleteOfficer, getOfficers, updateOfficer } from '../services/api';

export default function ManageOfficers() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setSnackbar] = useState(false);
  const [officers, setOfficers] = useState([]);
  const [loadingOfficers, setLoadingOfficers] = useState(false);
  const [lastCreatedOfficer, setLastCreatedOfficer] = useState(null);
  const [lastOfficerAction, setLastOfficerAction] = useState('created');
  const [editingOfficer, setEditingOfficer] = useState(null);

  useEffect(() => {
    const loadOfficers = async () => {
      setLoadingOfficers(true);
      try {
        const data = await getOfficers();
        setOfficers(data);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || 'Unable to load officers.');
      } finally {
        setLoadingOfficers(false);
      }
    };

    loadOfficers();
  }, []);

  // ─── Input Handler ───
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ─── Submit Handler ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const isEdit = Boolean(editingOfficer);
      const created = isEdit
        ? await updateOfficer({
            currentUsername: editingOfficer.username,
            newUsername: formData.username.trim(),
            newPassword: formData.password,
          })
        : await createOfficer({
            username: formData.username.trim(),
            password: formData.password,
          });
      setLastOfficerAction(isEdit ? 'updated' : 'created');
      setLastCreatedOfficer(created);
      setSnackbar(true);
      setFormData({ username: '', password: '' });
      setEditingOfficer(null);
      const refreshed = await getOfficers();
      setOfficers(refreshed);
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      setErrorMessage(apiMessage || 'Unable to create officer account.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (officer) => {
    setEditingOfficer(officer);
    setFormData({ username: officer.username || '', password: '' });
    setErrorMessage('');
  };

  const handleDelete = async (officer) => {
    const confirmed = window.confirm(`Delete officer ${officer.username}?`);
    if (!confirmed) return;

    try {
      await deleteOfficer(officer.username);
      const refreshed = await getOfficers();
      setOfficers(refreshed);
      if (editingOfficer?.username === officer.username) {
        setEditingOfficer(null);
        setFormData({ username: '', password: '' });
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to delete officer.');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Manage Officers</Typography>

      <Grid container spacing={3}>
        {/* Registration Form Column */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAddIcon />
              <Typography variant="h6">Register New Officer</Typography>
            </Box>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                  <TextField 
                    label="Officer Username" 
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required 
                    fullWidth 
                  />
                  <TextField 
                    label="Default Password" 
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required 
                    fullWidth 
                  />
                  {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="large" 
                      disabled={submitting}
                      sx={{ py: 1.5, fontWeight: 'bold', flex: 1 }}
                    >
                      {editingOfficer ? 'Update Officer' : 'Generate Officer Account'}
                    </Button>
                    {editingOfficer ? (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditingOfficer(null);
                          setFormData({ username: '', password: '' });
                          setErrorMessage('');
                        }}
                        sx={{ py: 1.5, fontWeight: 'bold' }}
                      >
                        Cancel
                      </Button>
                    ) : null}
                  </Stack>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Officers List Column */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Added Officers</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 360, width: '100%' }}>
                <DataGrid
                  rows={officers.map((officer, index) => ({ id: officer.username || index, ...officer }))}
                  columns={[
                    { field: 'username', headerName: 'Username', flex: 1, minWidth: 180 },
                      {
                        field: 'actions',
                        headerName: 'Actions',
                        width: 120,
                        sortable: false,
                        renderCell: (params) => (
                          <Box>
                            <IconButton size="small" onClick={() => startEdit(params.row)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete(params.row)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ),
                      },
                  ]}
                  loading={loadingOfficers}
                  disableRowSelectionOnClick
                  pageSizeOptions={[5, 10]}
                  initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Notification */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          {lastCreatedOfficer
            ? `Officer ${lastOfficerAction}: ${lastCreatedOfficer.username}.`
            : 'Officer account generated successfully!'}
        </Alert>
      </Snackbar>
    </Box>
  );
}