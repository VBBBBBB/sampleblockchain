import { Box, Card, CardContent, Grid, Typography, TextField, Button, Stack, Snackbar, Alert, Paper, Container } from '@mui/material';
import { useState } from 'react';
import FingerprintIcon from '@mui/icons-material/Fingerprint';

const API_URL = 'http://localhost:3000/api';

const RegisterCitizen = () => {
    const [aadhaar, setAadhaar] = useState('');
    const [familyMembers, setFamilyMembers] = useState(1);
    const [status, setStatus] = useState({ open: false, type: 'success', msg: '' });
    const [generatedHash, setGeneratedHash] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ open: false, type: '', msg: '' });
        setGeneratedHash('');

        try {
            const res = await fetch(`${API_URL}/citizen/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ aadhaarNumber: aadhaar, familyMembers })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to register citizen');

            setGeneratedHash(data.hash);
            setStatus({ open: true, type: 'success', msg: 'Citizen Hash generated and stored off-chain successfully!' });
            setAadhaar('');
        } catch (error) {
            setStatus({ open: true, type: 'error', msg: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Box mb={4}>
                <Typography variant="h4" fontWeight="800" gutterBottom>
                    Citizen Registration (UIDAI Gateway)
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Secure, off-chain biometric registration. Aadhaar numbers are converted to irreversible SHA-256 hashes.
                    The blockchain only receives the encrypted hash to strictly preserve citizen privacy.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box display="flex" alignItems="center" mb={3}>
                                <FingerprintIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                                <Typography variant="h6" fontWeight="bold">Biometric Enrollment</Typography>
                            </Box>
                            
                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        label="Aadhaar ID / National ID"
                                        variant="outlined"
                                        fullWidth
                                        required
                                        value={aadhaar}
                                        onChange={(e) => setAadhaar(e.target.value)}
                                        helperText="Simulates a biometric thumbprint or ID card scan."
                                    />
                                    <TextField
                                        label="Number of Family Members"
                                        type="number"
                                        variant="outlined"
                                        fullWidth
                                        required
                                        value={familyMembers}
                                        onChange={(e) => setFamilyMembers(parseInt(e.target.value) || 1)}
                                        inputProps={{ min: 1, max: 20 }}
                                        helperText="Strict Quota Enforced: 2kg Grain per family member."
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                        sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1.1rem' }}
                                    >
                                        {loading ? 'Hashing & Registering...' : 'Generate Secure Hash'}
                                    </Button>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={5}>
                    {generatedHash && (
                        <Card sx={{ borderRadius: 4, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', height: '100%' }}>
                            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                <Typography variant="subtitle2" color="success.main" fontWeight="bold" gutterBottom>
                                    REGISTRATION SUCCESSFUL
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Your Blockchain Hash Key
                                </Typography>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: '#ffffff', border: '1px dashed #4ade80', wordBreak: 'break-all' }}>
                                    <Typography variant="body2" fontFamily="monospace" color="text.primary">
                                        {generatedHash}
                                    </Typography>
                                </Paper>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                    Use this hash on the <b>Distribute Ration</b> page. The smart contract will automatically securely verify
                                    that this hash is permanently authorized by the Government database.
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>

            <Snackbar
                open={status.open}
                autoHideDuration={6000}
                onClose={() => setStatus({ ...status, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={status.type} variant="filled" sx={{ width: '100%' }}>
                    {status.msg}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default RegisterCitizen;
