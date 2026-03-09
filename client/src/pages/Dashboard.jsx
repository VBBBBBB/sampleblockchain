import { Box, Card, CardContent, Grid, Typography, LinearProgress, Stack, Chip, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useEffect, useState } from 'react';

// Reusing previous API logic but with modern components
const API_URL = 'http://localhost:3000/api';
const ANALYTICS_URL = 'http://localhost:3000/analytics';

const KPICard = ({ title, value, unit, trend, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Typography color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mr: 1, color: `${color}.main` }}>
                    {value}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                    {unit}
                </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="caption" color="success.main" fontWeight="bold">
                    📈 {trend}
                </Typography>
                <Typography variant="caption" color="text.secondary">vs last month</Typography>
            </Stack>
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const [totalStock, setTotalStock] = useState(0);
    const [totalRation, setTotalRation] = useState(0);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [assetRes, logRes] = await Promise.all([
                    fetch(`${API_URL}/all`),
                    fetch(`${ANALYTICS_URL}/logs`)
                ]);

                const rawAssets = await assetRes.json();
                const parsedAssets = rawAssets.map(item => {
                    try { return JSON.parse(item.substring(item.indexOf('Value: ') + 7)) }
                    catch (e) { return {} }
                });

                const logs = await logRes.json();

                setTotalStock(parsedAssets.reduce((acc, curr) => acc + (curr.balance || 0), 0));
                setTotalRation(logs.filter(l => l.type === 'RationIssued').reduce((acc, curr) => acc + (curr.quantity || 0), 0));
                setAssets(parsedAssets.slice(0, 5)); // Recent 5
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    if (loading) return <LinearProgress />;

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">Overview</Typography>
                <Stack direction="row" spacing={2}>
                    <Chip label="✅ Fabric Network Healthy" color="success" variant="outlined" size="small" />
                    <Chip label="🔄 Last Block #1294" variant="outlined" size="small" />
                </Stack>
            </Stack>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard title="Total Stock Reserves" value={totalStock.toLocaleString()} unit="kg" trend="+12%" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard title="Ration Distributed" value={totalRation.toLocaleString()} unit="kg" trend="+5.2%" color="info" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard title="Active Batches" value={assets.length} unit="" trend="+8%" color="warning" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard title="Fraud Attempts" value="0" unit="" trend="0%" color="error" />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" mb={2}>
                                <Typography variant="h6" fontWeight="bold">Recent Blockchain Activity</Typography>
                                <Chip label="Live from Ledger" size="small" color="primary" />
                            </Stack>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f9fafb' }}>
                                    <TableRow>
                                        <TableCell>Asset ID</TableCell>
                                        <TableCell>Commodity</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Balance</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {assets.map((row, i) => (
                                        <TableRow key={i} hover>
                                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{row.id}</TableCell>
                                            <TableCell>{row.commodity || row.commodityType}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.status}
                                                    size="small"
                                                    color={row.status === 'ALLOCATED' ? 'info' : row.status === 'EXHAUSTED' ? 'default' : 'success'}
                                                    sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                                                />
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>{row.balance} kg</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', bgcolor: '#fff3e0' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom color="warning.dark">
                                ⚠️ Fraud Alerts
                            </Typography>
                            <Stack spacing={2} mt={2}>
                                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, borderLeft: '4px solid #ed6c02' }}>
                                    <Typography variant="subtitle2" fontWeight="bold">High Velocity Issue</Typography>
                                    <Typography variant="caption" color="text.secondary">Shop #22 issued 500kg in 10 mins.</Typography>
                                </Box>
                                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, borderLeft: '4px solid green' }}>
                                    <Typography variant="subtitle2" fontWeight="bold">System Check</Typography>
                                    <Typography variant="caption" color="text.secondary">Orderer Consensus Latency Normal.</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
