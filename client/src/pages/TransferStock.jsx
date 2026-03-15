import { Box, Card, CardContent, Grid, Typography, TextField, Button, MenuItem, Stack, Snackbar, Alert, Chip, Table, TableHead, TableRow, TableCell, TableBody, LinearProgress, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/api';

const TransferStock = () => {
    const [formData, setFormData] = useState({ batchId: '', newOwner: '' });
    const [status, setStatus] = useState({ open: false, type: 'success', message: '' });
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyModal, setHistoryModal] = useState({ open: false, id: '', data: [] });

    const fetchAssets = async () => {
        try {
            const res = await fetch(`${API_URL}/all`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            const parsed = data.map(item => {
                try { return JSON.parse(item.substring(item.indexOf('Value: ') + 7)) }
                catch (e) { return {} }
            }).filter(item => item.id && !item.id.startsWith('QUOTA_') && item.balance > 0);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/transfer`, {
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
                setFormData({ batchId: '', newOwner: '' });
                fetchAssets();
            }
        } catch (e) { setStatus({ open: true, type: 'error', message: 'Failed to connect' }); }
    };

    return (
        <Box>
            <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">Supply Chain Logistics</Typography>
                <Chip label="Asset Transfer Node" color="secondary" variant="outlined" />
            </Stack>

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <CardContent>
                            <Stack spacing={2} direction="row" alignItems="center" mb={3}>
                                <Typography variant="h5">🚚</Typography>
                                <Typography variant="h6" fontWeight="bold">Transfer Custody</Typography>
                            </Stack>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    select fullWidth label="Select Asset Batch" margin="normal"
                                    value={formData.batchId} onChange={e => setFormData({ ...formData, batchId: e.target.value })}
                                    required
                                >
                                    {assets.map(a => (
                                        <MenuItem key={a.id} value={a.id}>{a.id} - {a.commodityType} ({a.balance}kg)</MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth label="New Owner (District/Shop ID)" margin="normal" variant="outlined"
                                    value={formData.newOwner} onChange={e => setFormData({ ...formData, newOwner: e.target.value })}
                                    placeholder="e.g. shop001"
                                    required
                                />
                                <Button
                                    type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.5, borderRadius: 2, fontWeight: 'bold', bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
                                >
                                    Execute Transfer
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={3}>Current Assets Status</Typography>
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
                                                <TableCell><Chip label={asset.currentOwner} size="small" variant="outlined" color="info" /></TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={asset.status}
                                                        size="small"
                                                        color={asset.status === 'ALLOCATED' ? 'primary' : asset.status === 'IN_TRANSIT' ? 'warning' : 'success'}
                                                        sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                    {asset.balance?.toLocaleString()} kg
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button size="small" variant="outlined" color="secondary" onClick={() => fetchHistory(asset.id)}>Provenance</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
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

export default TransferStock;
