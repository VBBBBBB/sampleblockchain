import { Box, Card, CardContent, Grid, Typography, TextField, Button, Stack, Snackbar, Alert, Chip } from '@mui/material';
import { useState } from 'react';

const API_URL = 'http://localhost:3000/api';

const OnboardShop = () => {
    const [formData, setFormData] = useState({ id: `shop_${Date.now()}`, name: '', district: '', dealer: '', license: '' });
    const [status, setStatus] = useState({ open: false, type: 'success', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/shop`, {
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
                setFormData({ id: `shop_${Date.now()}`, name: '', district: '', dealer: '', license: '' });
            }
        } catch (e) { setStatus({ open: true, type: 'error', message: 'Failed to connect' }); }
    };

    return (
        <Box>
            <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">Network Onboarding</Typography>
                <Chip label="Fair Price Shop Registration" color="info" variant="outlined" />
            </Stack>

            <Grid container justifyContent="center">
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <CardContent>
                            <Stack spacing={2} direction="row" alignItems="center" mb={3}>
                                <Typography variant="h5">🏪</Typography>
                                <Typography variant="h6" fontWeight="bold">Register New Shop Node</Typography>
                            </Stack>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth label="Shop Identity ID (Network Name)" margin="normal" variant="outlined"
                                    value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })}
                                    required
                                />
                                <TextField
                                    fullWidth label="Shop Name" margin="normal" variant="outlined"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <TextField
                                    fullWidth label="District" margin="normal" variant="outlined"
                                    value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })}
                                    required
                                />
                                <TextField
                                    fullWidth label="Dealer/Owner Name" margin="normal" variant="outlined"
                                    value={formData.dealer} onChange={e => setFormData({ ...formData, dealer: e.target.value })}
                                    required
                                />
                                <TextField
                                    fullWidth label="Govt License Number" margin="normal" variant="outlined"
                                    value={formData.license} onChange={e => setFormData({ ...formData, license: e.target.value })}
                                    required
                                />
                                <Button
                                    type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                                >
                                    Approve & Deploy to Ledger
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Snackbar open={status.open} autoHideDuration={6000} onClose={() => setStatus({ ...status, open: false })}>
                <Alert severity={status.type} sx={{ width: '100%' }}>{status.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default OnboardShop;
