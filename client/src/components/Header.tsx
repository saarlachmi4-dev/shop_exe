import { AppBar, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import { Sprout, LogOut } from 'lucide-react'; // מייבאים אייקון התנתקות נקי

type HeaderProps = {
  cartItemsCount: number;
  onCartClick: () => void;
  onLogout: () => void; // <-- הפרופ החדש של ההתנתקות
};

export function Header({ cartItemsCount, onCartClick, onLogout }: HeaderProps) {
  return (
    <AppBar position="sticky" color="inherit" elevation={1} sx={{ bgcolor: '#ffffff' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          
          {/* לוגו ושם המשתלה */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Sprout color="#2e7d32" size={28} />
            <Typography variant="h5" component="h1" fontWeight={800} color="success.main" sx={{ mr: 2 }}>
              משתלת הנבט הירוק
            </Typography>
          </Stack>

          {/* כפתורי הפעולות בצד שמאל */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            
            {/* כפתור העגלה הקיים שלך */}
            <Button 
              onClick={onCartClick} 
              variant="outlined" 
              color="success"
              sx={{ fontWeight: 600, borderRadius: 2 }}
            >
              עגלה ({cartItemsCount})
            </Button>

            {/* כפתור ההתנתקות החדש */}
            <Button 
              onClick={onLogout} 
              variant="text" 
              color="error"
              startIcon={<LogOut size={16} />}
              sx={{ fontWeight: 600, borderRadius: 2 }}
            >
              התנתק
            </Button>

          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}