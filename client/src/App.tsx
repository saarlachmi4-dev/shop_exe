import { useEffect, useState } from 'react';
import { Box, CircularProgress, Container, Grid, Stack, Typography, TextField, MenuItem, FormControl, InputLabel, Select, Button } from '@mui/material';
import axios from 'axios';
import { Header } from './components/Header';
import { Product, ProductCard } from './components/ProductCard';
import { CartPage } from './components/CartPage';
import { AuthPage } from './components/AuthPage';
import { OrdersPage } from './components/OrdersHistory'; // 👈 1. ייבוא עמוד ההזמנות החדש

type UserState = { id: number; name: string; email: string } | null;

function App() {
  const [user, setUser] = useState<UserState>(null);
  // 👈 2. עדכון הסטייט שיתמוך גם בניווט לעמוד ההזמנות ('orders')
  const [view, setView] = useState<'store' | 'cart' | 'orders'>('store');
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // --- אפקט "זכור אותי" ---
  useEffect(() => {
    async function checkPersistedUser() {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('http://127.0.0.1:3000/auth/me');
          setUser(response.data);
        } catch (err) {
          console.error('הטוקן פג תוקף או שאינו תקין, מנקים את ה-Storage');
          localStorage.removeItem('access_token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    }
    
    void checkPersistedUser();
  }, []);

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

  // טעינת נתונים רק אחרי שהמשתמש מחובר
  useEffect(() => {
    if (user) {
      async function initData() {
        setIsLoading(true);
        await Promise.all([loadProducts(), loadCart()]);
        setIsLoading(false);
      }
      void initData();
    }
  }, [user]);

  const handleRefreshAll = async () => {
    await Promise.all([loadProducts(), loadCart()]);
  };

  // טיפול בהתחברות מוצלחת
  const handleAuthSuccess = (authResponse: any) => {
    const { access_token, user: loggedInUser } = authResponse;
    localStorage.setItem('access_token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser(loggedInUser);
  };

  // מנוע הסינון
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

  if (isLoading && !user) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh', bgcolor: '#f7f9f6' }}>
        <CircularProgress color="success" size={50} />
        <Typography sx={{ mt: 2 }} color="text.secondary" fontWeight={500}>מתחבר לחממה...</Typography>
      </Stack>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // פונקציית עזר לרינדור התוכן הדינמי בהתאם לסטייט ה-view
  const renderView = () => {
    if (view === 'cart') {
      return (
        <CartPage 
          onBackToStore={() => setView('store')} 
          onCartUpdated={handleRefreshAll} 
          onOrderSuccess={() => setView('orders')} // 👈 3. העברת הפרופס החדש שינווט לעמוד ההזמנות לאחר Checkout מוצלח
        />
      );
    }
    
    if (view === 'orders') {
      return (
        <OrdersPage onBackToStore={() => setView('store')} /> // 👈 4. הצגת עמוד ההזמנות החדש
      );
    }

    // ברירת מחדל: תצוגת הקטלוג והחנות (view === 'store')
    return (
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 4 }} spacing={2}>
          <Stack spacing={1}>
            <Typography variant="h4" component="h2" fontWeight={850} color="#1b3a24">
              שלום, {user.name} 🌿
            </Typography>
            <Typography variant="body1" color="text.secondary">
              השתילים האורגניים שלך מחכים לך בחממה
            </Typography>
          </Stack>
          
          {/* כפתור מהיר למעבר לעמוד ההזמנות ישירות מהחנות */}
          <Button 
            variant="outlined" 
            color="success" 
            onClick={() => setView('orders')}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            📦 ההזמנות שלי
          </Button>
        </Stack>

        {/* שורת הפילטרים והחיפוש */}
        <Grid container spacing={2} sx={{ mb: 4, bgcolor: '#ffffff', p: 2, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
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
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9f6', pb: 8 }}>
      <Header 
        cartItemsCount={cartItemsCount}
        onCartClick={() => setView('cart')}
        onLogout={() => {
          localStorage.removeItem('access_token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          setView('store');
        } } onOrdersClick={function (): void {
          throw new Error('Function not implemented.');
        } }      />

      {/* רינדור התוכן הנבחר */}
      {renderView()}
    </Box>
  );
}

export default App;