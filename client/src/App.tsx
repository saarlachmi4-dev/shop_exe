import { useEffect, useState } from 'react';
import { Box, CircularProgress, Container, Grid, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { Header } from './components/Header';
import { Product, ProductCard } from './components/ProductCard';
import { CartPage } from './components/CartPage'; // <-- אימפורט לדף העגלה החדש

function App() {
  const [view, setView] = useState<'store' | 'cart'>('store'); // סטייט לניהול הדף הנוכחי
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // פונקציות ה-loadProducts וה-loadCart שכתבנו קודם נשארות בדיוק אותו דבר...
  async function loadProducts() {
    try {
      const response = await axios.get<Product[]>('http://127.0.0.1:3000/products');
      setProducts(response.data);
    } catch {
      setError('שגיאה בתקשורת עם השרת בהבאת מוצרים.');
    }
  }

  async function loadCart() {
    try {
      const response = await axios.get('http://127.0.0.1:3000/cart');
      const totalItems = response.data.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartItemsCount(totalItems);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      await Promise.all([loadProducts(), loadCart()]);
      setIsLoading(false);
    }
    void initData();
  }, []);

  const handleRefreshAll = async () => {
    await Promise.all([loadProducts(), loadCart()]);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9f6', pb: 8 }}>
      {/* לחיצה על ה-Header מעבירה אותנו למסך העגלה */}
      <Header cartItemsCount={cartItemsCount} onCartClick={() => setView('cart')} />

      {view === 'cart' ? (
        // --- תצוגת דף העגלה ---
        <CartPage 
          onBackToStore={() => setView('store')} 
          onCartUpdated={handleRefreshAll} 
        />
      ) : (
        // --- תצוגת החנות הרגילה (כל מה שהיה לך קודם ב-App.tsx) ---
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
            <Stack alignItems="center" justifyContent="center" sx={{ py: 12 }}><CircularProgress color="success" size={50} /></Stack>
          )}

          {!isLoading && !error && (
            <Grid container spacing={4}>
              {products.map((product) => (
                <Grid key={product.id} item xs={12} sm={6} md={4}>
                  <ProductCard product={product} onAddToCartSuccess={handleRefreshAll} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      )}
    </Box>
  );
}

export default App;