import { AppBar, Toolbar, Typography, Button, Badge, Container, Stack } from '@mui/material';
import { ShoppingCart, Sprout } from 'lucide-react';

type HeaderProps = {
  cartItemsCount: number; // מקבל את כמות הפריטים הכוללת
};

export function Header({ cartItemsCount }: HeaderProps) {
  return (
    <AppBar position="sticky" color="inherit" elevation={1} sx={{ bgcolor: '#ffffff' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Sprout color="#2e7d32" size={28} />
            <Typography variant="h5" component="h1" fontWeight={800} color="success.main" sx={{ mr: 2 }}>
              משתלת הנבט הירוק
            </Typography>
          </Stack>
          
          <Button 
            variant="outlined" 
            color="success" 
            startIcon={
              <Badge badgeContent={cartItemsCount} color="error">
                <ShoppingCart size={20} />
              </Badge>
            }
            sx={{ borderRadius: 2.5, px: 3, fontWeight: 600 }}
          >
            עגלת קניות
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}