import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { ShoppingCart } from 'lucide-react';

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f7f5', color: '#1f2933' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 6 }}>
          <Typography variant="h5" component="h1" fontWeight={700}>
            Shop Project
          </Typography>
          <Button variant="contained" startIcon={<ShoppingCart size={18} />}>
            Cart
          </Button>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: 680 }}>
          <Typography variant="h3" component="h2" fontWeight={800}>
            First screen is ready.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Next we will connect the API, add products, and build the cart step by step.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

export default App;

