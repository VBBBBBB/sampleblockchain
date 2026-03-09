import { Box, Card, CardContent, Button, TextField, Typography, Alert, CircularProgress, Container, Grid } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Backend login call
            const result = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await result.json();

            if (data.success) {
                // Success: Save token & state
                const userObj = { username: data.username, role: data.role, token: data.token };
                localStorage.setItem('user', JSON.stringify(userObj));
                // Just force a reload to let AuthContext pick it up (simplest way properly)
                window.location.href = '/';
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Server connection failed. Is backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#e3f2fd' }}>
            <Container maxWidth="xs">
                <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="h1" sx={{ fontSize: '3rem', mb: 1 }}>🔐</Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary">System Access</Typography>
                        <Typography variant="body2" color="text.secondary">Secure Ration Chain Login</Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            variant="outlined"
                            margin="normal"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            autoFocus
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            variant="outlined"
                            margin="normal"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Default Credentials:</Typography>
                        <Grid container spacing={1} mt={1}>
                            <Grid item xs={6}>
                                <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                    <b>Admin</b><br />admin / password123
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                    <b>Shop</b><br />shop / password123
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Card>
            </Container>
        </Box>
    );
};

export default Login;
