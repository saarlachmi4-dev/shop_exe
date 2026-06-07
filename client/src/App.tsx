import { useEffect, useState } from 'react';
import { Box, CircularProgress, Container, Grid, Stack, Typography, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import axios from 'axios';
import { Header } from './components/Header';
import { Product, ProductCard } from './components/ProductCard';
import { CartPage } from './components/CartPage';

function App() {
  const [view, setView] = useState<'store' | 'cart'>('store');
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // סטייטס עבור סינון ומיון לקוח
  const [searchQuery, setSearchQuery] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

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

  // --- מנוע הסינון והמיון בזמן אמת ---
  const filteredAndSortedProducts = products
    .filter((product) => {
      // 1. סינון לפי חיפוש שם
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. סינון לפי עונת גידול
      const matchesSeason = seasonFilter === 'all' || product.season === seasonFilter;
      
      return matchesSearch && matchesSeason;
    })
    .sort((a, b) => {
      // 3. מנגנון מיון לפי מחיר
      if (sortBy === 'price-asc') {
        return Number(a.price) - Number(b.price); // מהנמוך לגבוה
      }
      if (sortBy === 'price-desc') {
        return Number(b.price) - Number(a.price); // מהגבוה לנמוך
      }
      return 0; // ברירת מחדל (לפי ה-ID מהשרת)
    });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9f6', pb: 8 }}>
      <Header cartItemsCount={cartItemsCount} onCartClick={() => setView('cart')} />

      {view === 'cart' ? (
        <CartPage 
          onBackToStore={() => setView('store')} 
          onCartUpdated={handleRefreshAll} 
        />
      ) : (
        <Container maxWidth="lg" sx={{ mt: 5 }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" fontWeight={850} color="#1b3a24">
              השתילים שלנו
            </Typography>
            <Typography variant="body1" color="text.secondary">
              שתילים אורגניים וטריים ישירות מחממת הגידול לבית שלך
            </Typography>
          </Stack>

          {/* שורת כלי סינון, חיפוש ומיון */}
          {!isLoading && !error && (
            <Grid container spacing={2} sx={{ mb: 4, bgcolor: '#ffffff', p: 2, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              {/* חיפוש חופשי */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="חפש שתיל..."
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Grid>

              {/* סינון לפי עונה */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>סינון לפי עונה</InputLabel>
                  <Select
                    label="סינון לפי עונה"
                    value={seasonFilter}
                    onChange={(e) => setSeasonFilter(e.target.value)}
                  >
                    <MenuItem value="all">כל העונות</MenuItem>
                    <MenuItem value="קיץ">שתיל קיץ ☀️</MenuItem>
                    <MenuItem value="חורף">שתיל חורף 🌧️</MenuItem>
                    <MenuItem value="רב-עונתי">רב-עונתי 🌿</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* מיון לפי מחיר */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>מיון מוצרים</InputLabel>
                  <Select
                    label="מיון מוצרים"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="default">ברירת מחדל</MenuItem>
                    <MenuItem value="price-asc">מחיר: מהנמוך לגבוה ↑</MenuItem>
                    <MenuItem value="price-desc">מחיר: מהגבוה לנמוך ↓</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {isLoading && (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 12 }}>
              <CircularProgress color="success" size={50} />
            </Stack>
          )}

          {!isLoading && !error && (
            <>
              {filteredAndSortedProducts.length === 0 ? (
                <Typography textAlign="center" color="text.secondary" sx={{ py: 6, fontSize: '1.1rem' }}>
                  לא נמצאו שתילים התואמים את הסינון שבחרת... 
                </Typography>
              ) : (
                <Grid container spacing={4}>
                  {filteredAndSortedProducts.map((product) => (
                    <Grid key={product.id} item xs={12} sm={6} md={4}>
                      <ProductCard product={product} onAddToCartSuccess={handleRefreshAll} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Container>
      )}
    </Box>
  );
}

export default App;