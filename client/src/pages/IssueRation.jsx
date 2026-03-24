import { Box, Card, CardContent, Grid, Typography, TextField, Button, MenuItem, Stack, Snackbar, Alert, Chip, Divider } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3000/api';

const IssueRation = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        shopId: user?.username || '',
        cardHash: '',
        commodity: 'Wheat',
        quantity: ''
    });
    const [status, setStatus] = useState({ open: false, type: 'success', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isHacking, setIsHacking] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/ration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Current auth pattern
                },
                body: JSON.stringify({
                    ...formData,
                    quantity: parseFloat(formData.quantity),
                    isHacked: isHacking
                })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setStatus({ open: true, type: 'success', message: data.message });
                setFormData({ ...formData, cardHash: '', quantity: '' });
            } else {
                setStatus({ open: true, type: 'error', message: data.error || 'Transaction Failed' });
            }
        } catch (e) {
            setStatus({ open: true, type: 'error', message: 'Network Error: Failed to connect to Blockchain API' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box>
            <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">Issue Ration</Typography>
                <Chip label="Shop Dealer Portal" color="secondary" variant="outlined" />
            </Stack>

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>🛒</div>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">POS Terminal</Typography>
                                    <Typography variant="caption" color="text.secondary">Immutable Distribution Log</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 4 }} />

                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth label="Shop ID" variant="filled"
                                            value={formData.shopId} onChange={e => setFormData({ ...formData, shopId: e.target.value })}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth label="Citizen Card Hash / ID" variant="filled"
                                            placeholder="Enter Aadhar/Ration Card"
                                            value={formData.cardHash} onChange={e => setFormData({ ...formData, cardHash: e.target.value })}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            select fullWidth label="Commodity" variant="filled"
                                            value={formData.commodity} onChange={e => setFormData({ ...formData, commodity: e.target.value })}
                                        >
                                            <MenuItem value="Wheat">🌾 Wheat (Standard)</MenuItem>
                                            <MenuItem value="Rice">🍚 Rice (Basmati)</MenuItem>
                                            <MenuItem value="Sugar">🍬 Refined Sugar</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth type="number" label="Quantity (KG)" variant="filled"
                                            value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                            required
                                            inputProps={{ step: "0.1" }}
                                        />
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 5, p: 2, bgcolor: '#fff9e6', borderRadius: 2, display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 'bold' }}>
                                        ⚠️ WARNING: This action will be permanently recorded on the blockchain ledger and cannot be reversed.
                                    </Typography>
                                </Box>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                                    <Button
                                        type="submit" fullWidth variant="contained" size="large"
                                        disabled={isSubmitting}
                                        onClick={() => setIsHacking(false)}
                                        sx={{
                                            py: 2,
                                            borderRadius: 2,
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                                            boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)'
                                        }}
                                    >
                                        {isSubmitting && !isHacking ? 'Verifying with Ledger...' : 'Authorize Transaction'}
                                    </Button>

                                    <Button
                                        type="submit" fullWidth variant="contained" size="large" color="error"
                                        disabled={isSubmitting}
                                        onClick={() => setIsHacking(true)}
                                        sx={{
                                            py: 2,
                                            borderRadius: 2,
                                            fontWeight: 'bold',
                                            bgcolor: '#d32f2f',
                                            boxShadow: '0 3px 5px 2px rgba(211, 47, 47, .3)'
                                        }}
                                    >
                                        {isSubmitting && isHacking ? 'Simulating...' : 'Simulate District Node Hack'}
                                    </Button>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Card sx={{ height: '100%', borderRadius: 4, bgcolor: '#f8f9fa', border: '1px dashed #ced4da' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', p: 4, textAlign: 'center' }}>
                            <Box sx={{ mb: 2, color: 'text.disabled' }}>
                                <Typography variant="h1">💳</Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold">Biometric / Card Verification</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Real-time connection with UIDAI & NFSA established. <br />
                                Blockchain status: <b>Synchronized</b>
                            </Typography>

                            <Box sx={{ mt: 4, width: '100%' }}>
                                <Typography variant="caption" color="text.secondary" align="left" display="block" gutterBottom>LOG STREAM:</Typography>
                                <Box sx={{ bgcolor: 'black', p: 2, borderRadius: 1, fontFamily: 'monospace', color: '#00ff00', fontSize: '0.75rem', textAlign: 'left' }}>
                                    {">"} Ready for input... <br />
                                    {">"} Channel: district-shop-channel <br />
                                    {">"} MSP: ShopMSP <br />
                                    {isSubmitting && ">"} SIGNING TRANSACTION...
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar open={status.open} autoHideDuration={6000} onClose={() => setStatus({ ...status, open: false })}>
                <Alert severity={status.type} variant="filled" sx={{ width: '100%' }}>
                    {status.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default IssueRation;
