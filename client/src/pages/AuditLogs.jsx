import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

const AuditLogs = () => (
    <Box p={3}>
        <Typography variant="h4" gutterBottom>
            📜 Immutable Audit Trail
        </Typography>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Endorser MSP</TableCell>
                    <TableCell>Details</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {/* To be populated from specific Audit API */}
            </TableBody>
        </Table>
    </Box>
);
export default AuditLogs;
