import { useEffect, useState } from 'react';
import { Box, CircularProgress, Container, Grid, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { Header } from './components/Header';
import { Product, ProductCard } from './components/ProductCard';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // פונקציה לטעינת המוצרים (כולל המלאי המעודכן)
  async function loadProducts() {
    try {
      const response = await axios.get<Product[]>('http://127.0.0.1:3000/products');
      setProducts(response.data);
    } catch {
      setError('שגיאה בתקשורת עם השרת בהבאת מוצרים.');
    }
  }

  // פונקציה לטעינת העגלה וחישוב כמות הפריטים הכוללת
  async function loadCart() {
    try {
      const response = await axios.get('http://127.0.0.1:3000/cart');
      // סכימה של כל ה-quantity מכל הפריטים שיש בעגלה
      const totalItems = response.data.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartItemsCount(totalItems);
    } catch (err) {
      console.error('לא הצלחנו לטעון את נתוני העגלה מהשרת', err);
    }
  }

  // טעינה ראשונית של הדף
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      await Promise.all([loadProducts(), loadCart()]);
      setIsLoading(false);
    }
    void initData();
  }, []);

  // פונקציה שתופעל בכל פעם שמוצר מתווסף בהצלחה
  const handleRefreshAll = async () => {
    await Promise.all([loadProducts(), loadCart()]);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9f6', pb: 8 }}>
      {/* ה-Header מקבל את המונה בזמן אמת */}
      <Header cartItemsCount={cartItemsCount} />

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Stack spacing={1} sx={{ mb: 5 }}>
          <Typography variant="h4" component="h2" fontWeight={850} color="#1b3a24">
            השתילים שלנו
          </Typography>
          <Typography variant="body1" color="text.secondary">
            שתילים אורגניים וטריים ישירות מחממת הגידול לבית שלך
          </Typography>
        </Stack>

        {isLoading && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 12 }}>
            <CircularProgress color="success" size={50} />
          </Stack>
        )}

        {error && (
          <Typography color="error" textAlign="center" variant="h6" sx={{ py: 6, fontWeight: 500 }}>
            {error}
          </Typography>
        )}

        {!isLoading && !error && (
          <Grid container spacing={4}>
            {products.map((product) => (
              <Grid key={product.id} item xs={12} sm={6} md={4}>
                {/* מעבירים את פונקציית הרענון לכרטיס המוצר */}
                <ProductCard 
                  product={product} 
                  onAddToCartSuccess={handleRefreshAll} 
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default App;