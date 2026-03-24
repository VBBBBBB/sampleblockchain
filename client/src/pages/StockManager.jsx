import { Box, Card, CardContent, Grid, Typography, TextField, Button, MenuItem, Stack, Snackbar, Alert, Chip, Table, TableHead, TableRow, TableCell, TableBody, LinearProgress, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/api';

const StockManager = () => {
    const [formData, setFormData] = useState({ id: `batch_${Date.now()}`, commodity: 'Wheat', quantity: '' });
    const [status, setStatus] = useState({ open: false, type: 'success', message: '' });
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyModal, setHistoryModal] = useState({ open: false, id: '', data: [] });

    const fetchHistory = async (id) => {
        try {
            const res = await fetch(`${API_URL}/history/${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            const parsed = data.map(v => JSON.parse(v));
            setHistoryModal({ open: true, id, data: parsed });
        } catch (e) {
            setStatus({ open: true, type: 'error', message: 'Failed to fetch history' });
        }
    };

    const fetchAssets = async () => {
        try {
            const res = await fetch(`${API_URL}/all`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            const parsed = data.map(item => {
                try { return JSON.parse(item.substring(item.indexOf('Value: ') + 7)) }
                catch (e) { return {} }
            }).filter(item => item.id && !item.id.startsWith('QUOTA_')); // Only show stock batches
            setAssets(parsed);
        } catch (e) {
            console.error("Failed to fetch assets", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/stock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            setStatus({ open: true, type: data.success ? 'success' : 'error', message: data.message || data.error });
            if (data.success) {
                setFormData({ ...formData, id: `batch_${Date.now()}` });
                fetchAssets(); // Refresh table
            }
        } catch (e) { setStatus({ open: true, type: 'error', message: 'Failed to connect' }); }
    };

    return (
        <Box>
            <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">Stock Repository</Typography>
                <Chip label="Government Central Authority" color="primary" variant="outlined" />
            </Stack>

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <CardContent>
                            <Stack spacing={2} direction="row" alignItems="center" mb={3}>
                                <Typography variant="h5">🏗️</Typography>
                                <Typography variant="h6" fontWeight="bold">Mint New Asset</Typography>
                            </Stack>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth label="System Batch ID" margin="normal" variant="outlined"
                                    value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })}
                                    required
                                />
                                <TextField
                                    select fullWidth label="Commodity Type" margin="normal"
                                    value={formData.commodity} onChange={e => setFormData({ ...formData, commodity: e.target.value })}
                                >
                                    <MenuItem value="Wheat">🌾 Wheat (Grade A)</MenuItem>
                                    <MenuItem value="Rice">🍚 Rice (Basmati)</MenuItem>
                                    <MenuItem value="Sugar">🍬 Refined Sugar</MenuItem>
                                </TextField>
                                <TextField
                                    fullWidth type="number" label="Total Quantity (Metric Tons)" margin="normal"
                                    value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                />
                                <Button
                                    type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                                >
                                    Commit to Ledger
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={3}>Global Stock Ledger (Real-time)</Typography>
                            {loading ? <LinearProgress /> : (
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Batch ID</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Commodity</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Owner</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Balance</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {assets.map((asset) => (
                                            <TableRow key={asset.id} hover>
                                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{asset.id}</TableCell>
                                                <TableCell>{asset.commodityType || asset.commodity}</TableCell>
                                                <TableCell><Chip label={asset.currentOwner} size="small" variant="outlined" /></TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={asset.status}
                                                        size="small"
                                                        color={asset.status === 'EXHAUSTED' ? 'default' : 'success'}
                                                        sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                    {asset.balance?.toLocaleString()} kg
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button size="small" variant="outlined" color="secondary" onClick={() => fetchHistory(asset.id)}>Provenance</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {assets.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                    No assets found in the current state.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Snackbar open={status.open} autoHideDuration={6000} onClose={() => setStatus({ ...status, open: false })}>
                <Alert severity={status.type} sx={{ width: '100%' }}>{status.message}</Alert>
            </Snackbar>

            <Dialog open={historyModal.open} onClose={() => setHistoryModal({ open: false, id: '', data: [] })} maxWidth="md" fullWidth>
                <DialogTitle>Asset Provenance: {historyModal.id}</DialogTitle>
                <DialogContent>
                    {historyModal.data.map((state, index) => (
                        <Card key={index} sx={{ mb: 2, p: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Version {index + 1}</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>Owner: <b>{state.currentOwner}</b></Grid>
                                <Grid item xs={6}>Status: <b>{state.status}</b></Grid>
                                <Grid item xs={6}>Balance: <b>{state.balance} kg</b></Grid>
                            </Grid>
                        </Card>
                    ))}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default StockManager;
