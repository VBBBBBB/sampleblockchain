import { Box, Typography, Card, CardContent, Stack, Chip, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';

const FraudAlerts = () => {
    const alerts = [
        { id: 1, type: 'CRITICAL', title: 'High Velocity Issuance', shop: 'Shop_Alpha', detail: 'Issued 500kg in under 10 minutes.', time: '2 mins ago' },
        { id: 2, type: 'WARNING', title: 'Quota Over-Limit Attempt', shop: 'District_HQ', detail: 'Citizen ID #8892 tried to claim twice in 24h.', time: '1 hour ago' },
        { id: 3, type: 'INFO', title: 'System Node Sync', shop: 'Orderer_Service', detail: 'Block #1294 successfully replicated via Raft.', time: '15 mins ago' },
    ];

    return (
        <Box>
            <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">Security & Fraud Hub</Typography>
                <Chip label="Real-time Monitoring" color="error" variant="filled" sx={{ fontWeight: 'bold' }} />
            </Stack>

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 4 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Active Security Incidents</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <List>
                                {alerts.map((alert) => (
                                    <ListItem
                                        key={alert.id}
                                        sx={{
                                            mb: 2,
                                            bgcolor: alert.type === 'CRITICAL' ? '#fff5f5' : '#fcfcfc',
                                            borderRadius: 2,
                                            borderLeft: `5px solid ${alert.type === 'CRITICAL' ? '#f44336' : '#ff9800'}`
                                        }}
                                    >
                                        <ListItemIcon sx={{ fontSize: '1.5rem' }}>
                                            {alert.type === 'CRITICAL' ? '🚨' : '⚠️'}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Typography fontWeight="bold">{alert.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{alert.time}</Typography>
                                                </Stack>
                                            }
                                            secondary={
                                                <Box mt={0.5}>
                                                    <Typography variant="body2" color="text.primary">{alert.detail}</Typography>
                                                    <Typography variant="caption" color="text.secondary">Location: {alert.shop}</Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        <Card sx={{ bgcolor: '#1a237e', color: 'white', borderRadius: 4 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold">Blockchain Integrity</Typography>
                                <Typography variant="h3" sx={{ mt: 2 }}>99.9%</Typography>
                                <Typography variant="caption">Trust Score based on Consensus</Typography>
                                <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
                                <Typography variant="body2">Current Consensus: Raft (3/3 Nodes Up)</Typography>
                            </CardContent>
                        </Card>

                        <Card sx={{ borderRadius: 4 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold">Fraud Prevention Stats</Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2">Double-dipping Blocked: <b>12</b></Typography>
                                    <Typography variant="body2">Identity Mismatch: <b>4</b></Typography>
                                    <Typography variant="body2">Quota Verification: <b>100%</b></Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

// Internal Grid layout for FraudAlerts since I'm creating a new file
const Grid = ({ children, container, spacing, item, xs, md }) => {
    const style = container ? { display: 'flex', flexWrap: 'wrap', margin: `-${spacing * 4}px` } : { padding: `${spacing * 4}px`, flexBasis: md ? `${(md / 12) * 100}%` : xs ? `${(xs / 12) * 100}%` : '100%' };
    return <div style={style}>{children}</div>;
};

export default FraudAlerts;
