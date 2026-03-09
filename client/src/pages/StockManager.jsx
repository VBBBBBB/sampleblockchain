import { Box, Card, CardContent, Grid, Typography, TextField, Button, MenuItem, Stack, Snackbar, Alert, Chip } from '@mui/material';
import { useState } from 'react';

const API_URL = 'http://localhost:3000/api';

const StockManager = () => {
    const [formData, setFormData] = useState({ id: `batch_${Date.now()}`, commodity: 'Wheat', quantity: '' });
    const [status, setStatus] = useState({ open: false, type: 'success', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            setStatus({ open: true, type: data.success ? 'success' : 'error', message: data.message || data.error });
            if (data.success) setFormData({ ...formData, id: `batch_${Date.now()}` });
        } catch (e) { setStatus({ open: true, type: 'error', message: 'Failed to connect' }); }
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom mb={4}>Stock Management <Chip label="Govt Access" size="small" color="primary" /></Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2 }}>
                        <CardContent>
                            <Stack spacing={2} direction="row" alignItems="center" mb={2}>
                                <Typography variant="h4">📦</Typography>
                                <Typography variant="h6">Mint New Supply (Tokenize)</Typography>
                            </Stack>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth label="Batch ID" margin="normal" variant="outlined"
                                    value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })}
                                    required
                                />
                                <TextField
                                    select fullWidth label="Commodity Type" margin="normal"
                                    value={formData.commodity} onChange={e => setFormData({ ...formData, commodity: e.target.value })}
                                >
                                    <MenuItem value="Wheat">Wheat (Grade A)</MenuItem>
                                    <MenuItem value="Rice">Rice (Basmati)</MenuItem>
                                    <MenuItem value="Sugar">Refined Sugar</MenuItem>
                                </TextField>
                                <TextField
                                    fullWidth type="number" label="Quantity (metric tons)" margin="normal"
                                    value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                />
                                <Button
                                    type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.5 }}
                                >
                                    Commit to Blockchain
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    {/* Illustration or Map Placeholder */}
                    <Box sx={{ height: '100%', bgcolor: '#e3f2fd', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                        <Typography variant="body1" color="primary.dark" align="center">
                            Supply Chain Visualization Area <br /><span style={{ fontSize: '0.8rem' }}>(Coming in Phase 2)</span>
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
            <Snackbar open={status.open} autoHideDuration={6000} onClose={() => setStatus({ ...status, open: false })}>
                <Alert severity={status.type} sx={{ width: '100%' }}>{status.message}</Alert>
            </Snackbar>
        </Box>
    )
}
export default StockManager;
