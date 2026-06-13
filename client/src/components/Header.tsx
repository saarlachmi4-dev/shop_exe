import { AppBar, Toolbar, Typography, Button, Badge, Stack, Container } from '@mui/material';
import { ShoppingCart, LogOut, Sprout, ShoppingBag, ShieldAlert } from 'lucide-react';

type HeaderProps = {
  cartItemsCount: number;
  userRole?: string; 
  onCartClick: () => void;
  onOrdersClick: () => void;
  onAdminClick?: () => void; 
  onLogout: () => void;
};

export function Header({ cartItemsCount, userRole, onCartClick, onOrdersClick, onAdminClick, onLogout }: HeaderProps) {
  return (
    <AppBar position="sticky" sx={{ bgcolor: '#ffffff', color: '#1b3a24', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', direction: 'rtl' }}>
          
          {/* כפתורי הניווט והפעולות - ממוקמים בצד ימין של הבר */}
          <Stack direction="row" alignItems="center" spacing={2}>

            {/* כפתור התנתקות מהמערכת */}
            <Button
              variant="text"
              color="error"
              onClick={onLogout}
              startIcon={<LogOut size={16} />}
              sx={{ 
                borderRadius: 2.5, 
                fontWeight: 'bold',
                px: 2.5,
                boxShadow: '0 4px 12px rgba(75, 78, 121, 0.2)',
                '&:hover': { bgcolor: '#e0dbdb' }
              }}
            >
              יציאה
            </Button>
            
            {/* 👑 כפתור פאנל ניהול אדמין - יוצג רק אם המשתמש הוא אדמין */}
            {userRole === 'admin' && onAdminClick && (
              <Button
                variant="outlined"
                color="error"
                onClick={onAdminClick}
                startIcon={<ShieldAlert size={16} />}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 'bold',
                  px: 2.5,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2, bgcolor: '#fff5f5' }
                }}
              >
                ניהול מערכת ⚙️
              </Button>
            )}

            {/* כפתור למעבר לעמוד ההזמנות המלא */}
            <Button
              variant="contained"
              color="success"
              onClick={onOrdersClick}
              startIcon={
                <Badge color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 'bold' } }}>
                  <ShoppingBag size={18} />
                </Badge>
              }
              sx={{ 
                borderRadius: 2.5, 
                fontWeight: 'bold',
                px: 2.5,
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                '&:hover': { bgcolor: '#1b5e20' }
              }}
            >
              ההזמנות שלי
            </Button>

            {/* כפתור עגלת הקניות */}
            <Button
              variant="contained"
              color="success"
              onClick={onCartClick}
              startIcon={
                <Badge badgeContent={cartItemsCount} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 'bold' } }}>
                  <ShoppingCart size={18} />
                </Badge>
              }
              sx={{ 
                borderRadius: 2.5, 
                fontWeight: 'bold',
                px: 2.5,
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                '&:hover': { bgcolor: '#1b5e20' }
              }}
            >
              העגלה שלי
            </Button>
          </Stack>

          {/* לוגו ושם המשתלה - מיושר כעת בצד שמאל */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ cursor: 'pointer' }} onClick={() => window.location.reload()}>
            <Sprout color="#2e7d32" size={28} />
            <Typography variant="h6" component="h1" fontWeight={850} color="success.main" sx={{ letterSpacing: '-0.5px' }}>
              הנבט הירוק
            </Typography>
          </Stack>

        </Toolbar>
      </Container>
    </AppBar>
  );
}