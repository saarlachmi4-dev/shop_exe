import { useEffect, useState } from 'react';
import { Box, CircularProgress, Container, Grid, Stack, Typography, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import axios from 'axios';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { CartPage } from './components/CartPage';
import { AuthPage } from './components/AuthPage';
import { OrdersPage } from './components/OrdersHistory';
import { AdminPage } from './components/AdminPage'; 

type UserState = { id: number; name: string; email: string; role?: string } | null;

function App() {
  const [user, setUser] = useState<UserState>(null);
  const [view, setView] = useState<'store' | 'cart' | 'orders' | 'admin'>('store');
  const [products, setProducts] = useState<any[]>([]);
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
      const response = await axios.get<any[]>('http://127.0.0.1:3000/products');
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

  // 🟢 שינוי כאן: הפעלת הנתונים מחדש בכל פעם שהמשתמש מחובר או מחליף תצוגה חזרה לחנות
  useEffect(() => {
    if (user) {
      async function initData() {
        // מפעיל את הריענון רק אם המשתמש נמצא כרגע פיזית במסך החנות
        if (view === 'store') {
          setIsLoading(true);
          await Promise.all([loadProducts(), loadCart()]);
          setIsLoading(false);
        }
      }
      void initData();
    }
  }, [user, view]); 

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

  // מנוע הסינון והמיון המשולב - מאפשר חיפוש טקסטואלי גמיש וסינון עונות מתקדם
  const filteredAndSortedProducts = products
    .filter((product) => {
      // 1. בדיקת חיפוש טקסטואלי
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. בדיקת סינון עונות גמישה
      if (seasonFilter === 'all') {
        return matchesSearch; // אם נבחר "כל העונות", מספיק שהחיפוש יתאים
      }

      const productSeason = product.season || '';
      
      // בודק האם ערך העונה של המוצר שווה לבחירה, או מוכל בה (למשל "קיץ" מוכל בתוך "שתיל קיץ")
      const matchesSeason = 
        productSeason === seasonFilter || 
        seasonFilter.includes(productSeason) ||
        productSeason.includes(seasonFilter.replace('שתיל ', ''));

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

  const renderView = () => {
    if (view === 'cart') {
      return (
        <CartPage
          onBackToStore={() => setView('store')}
          onCartUpdated={handleRefreshAll}
          onOrderSuccess={() => setView('orders')}
        />
      );
    }

    if (view === 'orders') {
      return (
        <OrdersPage onBackToStore={() => setView('store')} />
      );
    }

    if (view === 'admin') {
      return (
        <AdminPage
          userRole={user?.role}
          onBackToStore={() => setView('store')}
        />
      );
    }

    return (
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 4 }} spacing={2}>
          <Stack spacing={1}>
            <Typography variant="h4" component="h2" fontWeight={850} color="#1b3a24">
              שלום, {user.name} {user.role === 'admin' ? '👑 (מנהל)' : '🌿'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              השתילים האורגניים שלך מחכים לך בחממה
            </Typography>
          </Stack>
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
                {/* 🛠️ תיקון: התאמת הערכים לערכי המערכת החדשים לסינון תקין */}
                <MenuItem value="שתיל קיץ">שתיל קיץ ☀️</MenuItem>
                <MenuItem value="שתיל חורף">שתיל חורף 🌧️</MenuItem>
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
                <ProductCard
                  product={product}
                  userRole={user?.role}
                  onAddToCartSuccess={handleRefreshAll}
                  onDeleteProductSuccess={handleRefreshAll}
                />
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
        userRole={user?.role}
        onCartClick={() => setView('cart')}
        onOrdersClick={() => setView('orders')}
        onAdminClick={() => setView('admin')}
        onLogout={() => {
          localStorage.removeItem('access_token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          setView('store');
        }}
      />

      {renderView()}
    </Box>
  );
}

export default App;