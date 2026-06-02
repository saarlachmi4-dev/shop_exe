import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { ShoppingCart } from 'lucide-react';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
};

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await axios.get<Product[]>('http://127.0.0.1:3000/products');
        setProducts(response.data);
      } catch {
        setError('Could not load products from the server.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', color: '#1f2933' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 6 }}>
          <Typography variant="h5" component="h1" fontWeight={700}>
            Shop Project
          </Typography>
          <Button variant="contained" startIcon={<ShoppingCart size={18} />}>
            Cart
          </Button>
        </Stack>

        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" fontWeight={800}>
            Products
          </Typography>
          <Typography variant="body1" color="text.secondary">
            These products are coming from the NestJS API.
          </Typography>
        </Stack>

        {isLoading && (
          <Stack alignItems="center" sx={{ py: 8 }}>
            <CircularProgress />
          </Stack>
        )}

        {error && (
          <Typography color="error" sx={{ py: 4 }}>
            {error}
          </Typography>
        )}

        {!isLoading && !error && (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid key={product.id} item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%', borderRadius: 2 }}>
                  <CardMedia
                    component="img"
                    height="220"
                    image={product.imageUrl}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                      <Typography variant="h6" component="h3" fontWeight={700}>
                        {product.name}
                      </Typography>
                      <Chip label={`$${product.price}`} color="primary" size="small" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, minHeight: 60 }}>
                      {product.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.stock} in stock
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button fullWidth variant="contained" startIcon={<ShoppingCart size={18} />}>
                      Add to cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default App;
