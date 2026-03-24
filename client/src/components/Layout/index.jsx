import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Dashboard from '../../pages/Dashboard';
import StockManager from '../../pages/StockManager';
import IssueRation from '../../pages/IssueRation';
import AuditLogs from '../../pages/AuditLogs';
import FraudAlerts from '../../pages/FraudAlerts';
import TransferStock from '../../pages/TransferStock';
import OnboardShop from '../../pages/OnboardShop';
import RegisterCitizen from '../../pages/RegisterCitizen';

const drawerWidth = 240;

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // RBAC: Logic to filter sidebar items // Added the new pages with roles
    const allItems = [
        { text: 'Dashboard', icon: '📊', path: '/', roles: ['Govt', 'District', 'Shop'] },
        { text: 'Stock Management', icon: '📦', path: '/stock', roles: ['Govt'] },
        { text: 'Transfer Custody', icon: '🚚', path: '/transfer', roles: ['Govt', 'District'] },
        { text: 'Register Citizen', icon: '🪪', path: '/register', roles: ['Govt'] },
        { text: 'Onboard Shop', icon: '🏪', path: '/onboard', roles: ['Govt', 'District'] },
        { text: 'Issue Ration', icon: '🛒', path: '/issue', roles: ['Shop'] },
        { text: 'Audit Logs', icon: '📜', path: '/audit', roles: ['Govt', 'District'] },
        { text: 'Fraud Alerts', icon: '⚠️', path: '/fraud', roles: ['Govt'] },
    ];

    const allowedItems = allItems.filter(item =>
        item.roles.includes(user?.role || 'Govt')
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#ffffff', color: '#333', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <Toolbar>
                    <Box sx={{ mr: 2, fontSize: '1.5rem' }}>🛡️</Box>
                    <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                        Enterprise Ration Chain
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ textAlign: 'right', mr: 2, display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                {user?.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                {user?.role} Access
                            </Typography>
                        </Box>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#1976d2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '1rem', border: '2px solid #e3f2fd' }}>
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <Button
                            onClick={handleLogout}
                            color="error"
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: 4, textTransform: 'none' }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #f0f0f0' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', mt: 2 }}>
                    <List>
                        {allowedItems.map((item) => (
                            <ListItem
                                button
                                key={item.text}
                                component={NavLink}
                                to={item.path}
                                sx={{
                                    mb: 1,
                                    mx: 1,
                                    borderRadius: 2,
                                    '&.active': { bgcolor: 'primary.light', color: 'primary.dark' },
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, fontSize: '1.2rem' }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2, borderTop: '1px solid #f0f0f0', bgcolor: '#fafafa' }}>
                    <Typography variant="caption" color="text.secondary" display="block" align="center">
                        v2.4.0 (Production)
                    </Typography>
                    <Typography variant="caption" color="text.disabled" display="block" align="center">
                        Hyperledger Powered
                    </Typography>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
                <Toolbar />
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    {allowedItems.find(i => i.path === '/stock') && <Route path="/stock" element={<StockManager />} />}
                    {allowedItems.find(i => i.path === '/transfer') && <Route path="/transfer" element={<TransferStock />} />}
                    {allowedItems.find(i => i.path === '/register') && <Route path="/register" element={<RegisterCitizen />} />}
                    {allowedItems.find(i => i.path === '/onboard') && <Route path="/onboard" element={<OnboardShop />} />}
                    {allowedItems.find(i => i.path === '/issue') && <Route path="/issue" element={<IssueRation />} />}
                    {allowedItems.find(i => i.path === '/audit') && <Route path="/audit" element={<AuditLogs />} />}
                    {allowedItems.find(i => i.path === '/fraud') && <Route path="/fraud" element={<FraudAlerts />} />}
                    <Route path="*" element={<Typography variant="h5" color="error">403 Access Denied</Typography>} />
                </Routes>
            </Box>
        </Box>
    );
};

export default Layout;
