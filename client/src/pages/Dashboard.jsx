import { Box, Card, CardContent, Grid, Typography, LinearProgress, Stack, Chip, Table, TableHead, TableRow, TableCell, TableBody, Button, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3000/api';
const ANALYTICS_URL = 'http://localhost:3000/analytics';

const KPICard = ({ title, value, unit, trend, color = 'primary', icon }) => (
    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', right: -10, top: -10, fontSize: '4rem', opacity: 0.05, transform: 'rotate(15deg)' }}>{icon}</Box>
        <CardContent>
            <Typography color="text.secondary" gutterBottom sx={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mr: 1, color: `${color}.main` }}>
                    {value}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    {unit}
                </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={1}>
                {trend && <Chip label={trend} size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900 }} />}
                {trend && <Typography variant="caption" color="text.secondary">Growth vs Phase 1</Typography>}
            </Stack>
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [totalStock, setTotalStock] = useState(0);
    const [totalRation, setTotalRation] = useState(0);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Normally we would pass headers to APIs for role-restricted data
                const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
                const [assetRes, logRes] = await Promise.all([
                    fetch(`${API_URL}/all`, { headers }),
                    fetch(`${ANALYTICS_URL}/logs`)
                ]);

                const rawAssets = await assetRes.json();
                const parsedAssets = rawAssets.map(item => {
                    try { return JSON.parse(item.substring(item.indexOf('Value: ') + 7)) }
                    catch (e) { return {} }
                }).filter(a => a.id && !a.id.startsWith('QUOTA_'));

                const logs = await logRes.json();

                // Custom logic depending on role for MVP
                if (user?.role === 'Shop') {
                    const shopAssets = parsedAssets.filter(a => a.currentOwner === user.username);
                    setTotalStock(shopAssets.reduce((acc, curr) => acc + (curr.balance || 0), 0));
                    setTotalRation(logs.filter(l => l.type === 'RationIssued' && l.shopId === user.username).reduce((acc, curr) => acc + (curr.quantity || 0), 0));
                    setAssets(shopAssets.slice(0, 5));
                } else if (user?.role === 'District') {
                    // Filter assets transferring through district
                    const distAssets = parsedAssets.filter(a => a.currentOwner === user.username);
                    setTotalStock(distAssets.reduce((acc, curr) => acc + (curr.balance || 0), 0));
                    setTotalRation(logs.filter(l => l.type === 'StockTransferred').length); // using count for demo
                    setAssets(distAssets.slice(0, 5));
                } else {
                    // Govt sees everything
                    setTotalStock(parsedAssets.reduce((acc, curr) => acc + (curr.balance || 0), 0));
                    setTotalRation(logs.filter(l => l.type === 'RationIssued').reduce((acc, curr) => acc + (curr.quantity || 0), 0));
                    setAssets(parsedAssets.slice(0, 5));
                }
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchAll();
    }, [user?.role, user?.username]);

    if (loading) return <Box sx={{ width: '100%', mt: 4 }}><LinearProgress /></Box>;

    const renderGovtKPIs = () => (
        <>
            <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Global Reserves" value={totalStock.toLocaleString()} unit="KG" trend="+14.2%" icon="📉" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Total Distributed" value={totalRation.toLocaleString()} unit="KG" trend="+5.8%" color="info" icon="🚛" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Active Batches" value={assets.length} unit="TOKENS" trend="+2" color="warning" icon="📦" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <KPICard title="Fraud Prevention" value="100" unit="%" trend="STABLE" color="error" icon="🛡️" />
            </Grid>
        </>
    );

    const renderDistrictKPIs = () => (
        <>
            <Grid item xs={12} sm={6} md={4}>
                <KPICard title="District Warehouse" value={totalStock.toLocaleString()} unit="KG" icon="🏢" color="primary" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <KPICard title="Transfers Processed" value={totalRation.toLocaleString()} unit="TXNs" icon="🔄" color="info" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <KPICard title="Active Asset Nodes" value={assets.length} unit="TOKENS" icon="📦" color="warning" />
            </Grid>
        </>
    );

    const renderShopKPIs = () => (
        <>
            <Grid item xs={12} sm={6} md={6}>
                <KPICard title="Current Shop Inventory" value={totalStock.toLocaleString()} unit="KG" icon="🏪" color="primary" />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
                <KPICard title="Retail Rations Issued" value={totalRation.toLocaleString()} unit="KG" icon="🛍️" color="success" />
            </Grid>
        </>
    );

    return (
        <Box>
            {/* Top Bar with System Status */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="800">Operational Command</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Real-time Blockchain Synchronized Dashboard - <span style={{ fontWeight: 'bold' }}>{user?.role} View</span>
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Chip label="NETWORK ACTIVE" color="success" icon={<Box sx={{ fontSize: '0.6rem' }}>●</Box>} sx={{ px: 1, fontWeight: 'bold' }} />
                    <Chip label="CONSENSUS: RAFT" variant="outlined" sx={{ fontWeight: 'bold' }} />
                    {user?.role !== 'Shop' && <Button variant="contained" size="small" onClick={() => navigate('/audit')} sx={{ borderRadius: 2, textTransform: 'none' }}>Verify Ledger</Button>}
                </Stack>
            </Stack>

            {/* KPI Section */}
            <Grid container spacing={3} mb={4}>
                {user?.role === 'Govt' && renderGovtKPIs()}
                {user?.role === 'District' && renderDistrictKPIs()}
                {user?.role === 'Shop' && renderShopKPIs()}
            </Grid>

            <Grid container spacing={3}>
                {/* Recent Block Transactions */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 4, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6" fontWeight="bold">Supply Stream Custody</Typography>
                                <Chip label="Live Blockchain Data" size="small" variant="outlined" />
                            </Stack>
                            <Table size="medium">
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Entity ID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Commodity</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Owner</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Balance</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {assets.map((row, i) => (
                                        <TableRow key={i} hover>
                                            <TableCell sx={{ fontFamily: 'monospace', color: 'primary.main', fontSize: '0.8rem' }}>{row.id}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>{row.commodity || row.commodityType}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ bgcolor: '#eee', px: 1, py: 0.5, borderRadius: 1 }}>{row.currentOwner}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.status}
                                                    size="small"
                                                    color={row.status === 'ALLOCATED' ? 'info' : row.status === 'EXHAUSTED' ? 'default' : 'success'}
                                                    sx={{ fontWeight: 'bold', fontSize: '0.65rem', height: 20 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>{row.balance} kg</TableCell>
                                        </TableRow>
                                    ))}
                                    {assets.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 3 }} color="text.secondary">
                                                No assets currently assigned to this view.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            {user?.role === 'Govt' && (
                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Button variant="text" color="primary" onClick={() => navigate('/stock')}>View All Assets →</Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* System Visualization / Quick Actions */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        <Card sx={{ borderRadius: 4, bgcolor: '#0f172a', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>Trust Anchor</Typography>
                                <Divider sx={{ my: 1.5, bgcolor: 'rgba(255,255,255,0.1)' }} />
                                <Stack spacing={2} sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2">Identity Node</Typography>
                                        <Typography variant="body2" color="#4ade80" fontWeight="bold">{user?.username}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2">Permission Level</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>{user?.role}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2">Fabric SDK</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Connected</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card sx={{ borderRadius: 4, bgcolor: '#f1f5f9' }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>Quick Actions</Typography>
                                <Stack spacing={1} sx={{ mt: 2 }}>
                                    {user?.role === 'Govt' && (
                                        <>
                                            <Button fullWidth variant="outlined" sx={{ justifyContent: 'start', borderRadius: 2, bgcolor: 'white' }} onClick={() => navigate('/stock')}>🚀 Mint New Batch</Button>
                                            <Button fullWidth variant="outlined" sx={{ justifyContent: 'start', borderRadius: 2, bgcolor: 'white' }} onClick={() => navigate('/fraud')}>🚨 View Alerts</Button>
                                        </>
                                    )}
                                    {['Govt', 'District'].includes(user?.role) && (
                                        <Button fullWidth variant="outlined" sx={{ justifyContent: 'start', borderRadius: 2, bgcolor: 'white' }} onClick={() => navigate('/transfer')}>🚚 Transfer Custody</Button>
                                    )}
                                    {user?.role === 'Shop' && (
                                        <Button fullWidth variant="outlined" sx={{ justifyContent: 'start', borderRadius: 2, bgcolor: 'white' }} onClick={() => navigate('/issue')}>🛒 Distribute Ration</Button>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
