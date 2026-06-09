import { useEffect, useState } from 'react';
import { Box, CircularProgress, Container, Grid, Stack, Typography, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import axios from 'axios';
import { Header } from './components/Header';
import { Product, ProductCard } from './components/ProductCard';
import { CartPage } from './components/CartPage';
import { AuthPage } from './components/AuthPage'; // <-- אימפורט לדף הכניסה החדש

type UserState = { id: number; name: string; email: string } | null;

function App() {
  // סטייט המשתמש המחובר - מתחיל כ-null
  const [user, setUser] = useState<UserState>(null);
  const [view, setView] = useState<'store' | 'cart'>('store');
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // פילטרים קיימים
  const [searchQuery, setSearchQuery] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // טעינת מוצרים מהשרת
  async function loadProducts() {
    try {
      const response = await axios.get<Product[]>('http://127.0.0.1:3000/products');
      setProducts(response.data);
    } catch {
      setError('שגיאה בתקשורת עם השרת בהבאת מוצרים.');
    }
  }

  // טעינת העגלה
  async function loadCart() {
    try {
      const response = await axios.get('http://127.0.0.1:3000/cart');
      const totalItems = response.data.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartItemsCount(totalItems);
    } catch (err) {
      console.error(err);
    }
  }

  // אנחנו רוצים לטעון את הנתונים רק אחרי שהמשתמש ביצע התחברות מוצלחת
  useEffect(() => {
    if (user) {
      async function initData() {
        setIsLoading(true);
        await Promise.all([loadProducts(), loadCart()]);
        setIsLoading(false);
      }
      void initData();
    }
  }, [user]); // ירוץ מחדש ברגע שהמשתמש משתנה

  const handleRefreshAll = async () => {
    await Promise.all([loadProducts(), loadCart()]);
  };

  const handleAuthSuccess = (loggedInUser: { id: number; name: string; email: string }) => {
    setUser(loggedInUser); // שמירת המשתמש בסטייט ופתיחת האתר
  };

  // מנוע הסינון הקיים שלך...
  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeason = seasonFilter === 'all' || product.season === seasonFilter;
      return matchesSearch && matchesSeason;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
      return 0;
    });

  // --- הגנת כניסה: אם המשתמש לא מחובר, מראים רק את דף הכניסה ---
  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9f6', pb: 8 }}>
      <Header cartItemsCount={cartItemsCount} onCartClick={() => setView('cart')} />

      {view === 'cart' ? (
        <CartPage onBackToStore={() => setView('store')} onCartUpdated={handleRefreshAll} />
      ) : (
        <Container maxWidth="lg" sx={{ mt: 5 }}>
          {/* כל קוד הקטלוג והפילטרים הקיים והמעולה שלך נשאר כאן בדיוק אותו דבר */}
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" fontWeight={850} color="#1b3a24">
              שלום, {user.name} 🌿
            </Typography>
            <Typography variant="body1" color="text.secondary">
              השתילים האורגניים שלך מחכים לך בחממה
            </Typography>
          </Stack>

          {/* שורת הפילטרים ורשת ה-Grid של המוצרים ממשיכים מכאן... */}
          <Grid container spacing={2} sx={{ mb: 4, bgcolor: '#ffffff', p: 2, borderRadius: 3 }}>
            {/* פקדי הסינון שלך */}
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="חפש שתיל..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>סינון לפי עונה</InputLabel>
                <Select label="סינון לפי עונה" value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)}>
                  <MenuItem value="all">כל העונות</MenuItem>
                  <MenuItem value="קיץ">שתיל קיץ ☀️</MenuItem>
                  <MenuItem value="חורף">שתיל חורף 🌧️</MenuItem>
                  <MenuItem value="רב-עונתי">רב-עונתי 🌿</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>מיון מוצרים</InputLabel>
                <Select label="מיון מוצרים" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <MenuItem value="default">ברירת מחדל</MenuItem>
                  <MenuItem value="price-asc">מחיר: מהנמוך לגבוה ↑</MenuItem>
                  <MenuItem value="price-desc">מחיר: מהגבוה לנמוך ↓</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {isLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 12 }}><CircularProgress color="success" size={50} /></Stack>
          ) : (
            <Grid container spacing={4}>
              {filteredAndSortedProducts.map((product) => (
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