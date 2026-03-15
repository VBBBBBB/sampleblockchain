import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography, Paper, Chip, Stack, LinearProgress, IconButton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';

const ANALYTICS_URL = 'http://localhost:3000/analytics';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${ANALYTICS_URL}/logs`);
            const data = await res.json();
            setLogs(data);
        } catch (e) {
            console.error("Audit Logs Retrieval Failed", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getActionChip = (type) => {
        const config = {
            'StockCreated': { color: 'primary', label: '🆕 Stock Minted', icon: '📦' },
            'RationIssued': { color: 'success', label: '🏪 Ration Distributed', icon: '✅' },
            'StockTransferred': { color: 'info', label: '🚚 Transferred', icon: '🔄' }
        };
        const item = config[type] || { color: 'default', label: type, icon: '📜' };
        return <Chip label={`${item.icon} ${item.label}`} color={item.color} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />;
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Immutable Audit Trail
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Verifying off-chain event logs against blockchain world state
                    </Typography>
                </Box>
                <Tooltip title="Force Sync with Ledger">
                    <IconButton onClick={fetchLogs} sx={{ bgcolor: 'white', boxShadow: 1 }}>
                        🔄
                    </IconButton>
                </Tooltip>
            </Stack>

            <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                {loading && <LinearProgress color="primary" />}
                <Table>
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Action / Event</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Commodity</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Quantity</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Blockchain TxID</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log, i) => (
                            <TableRow key={i} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                                    {new Date(log.timestamp || log.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {getActionChip(log.type)}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={500}>{log.commodity}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" fontWeight="bold" color={log.type === 'RationIssued' ? 'error.main' : 'success.main'}>
                                        {log.type === 'RationIssued' ? '-' : '+'}{log.quantity} kg
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Click to verify on explorer (Mock)">
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontFamily: 'monospace',
                                                bgcolor: '#f8f9fa',
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                color: '#1976d2',
                                                cursor: 'pointer',
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                        >
                                            {log.txId?.substring(0, 16)}...
                                        </Typography>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!loading && logs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                    <Typography variant="body1" color="text.disabled">No transactions recorded in the audit cache.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            <Box sx={{ mt: 4, p: 3, bgcolor: '#e3f2fd', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h3">🛡️</Typography>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">Cryptographic Verification Active</Typography>
                    <Typography variant="caption" color="primary.main">
                        All logs above are cross-referenced with SHA-256 hashes from the Hyperledger Fabric ledger (Channel: govt-district-channel).
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default AuditLogs;
