import { useEffect, useState } from 'react';
import { Box, CircularProgress, Container, Grid, Stack, Typography, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import axios from 'axios';
import { Header } from './components/Header';
import { Product, ProductCard } from './components/ProductCard';
import { CartPage } from './components/CartPage';
import { AuthPage } from './components/AuthPage';

type UserState = { id: number; name: string; email: string } | null;

function App() {
  const [user, setUser] = useState<UserState>(null);
  const [view, setView] = useState<'store' | 'cart'>('store');
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true); // סטייט טעינה התחלתי לבדיקת הסטטוס
  const [error, setError] = useState('');

  // פילטרים קיימים
  const [searchQuery, setSearchQuery] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // --- 1. אפקט "זכור אותי" - רץ פעם אחת מיד עם פתיחת האתר בדפדפן ---
  useEffect(() => {
    async function checkPersistedUser() {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          // הגדרת הטוקן כברירת מחדל לכל בקשות ה-axios הבאות
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // בקשת פרטי הפרופיל של המשתמש מה-Endpoint הייעודי
          const response = await axios.get('http://127.0.0.1:3000/auth/me');
          
          // אם הטוקן תקין, המשתמש נשאר מחובר אוטומטית!
          setUser(response.data);
        } catch (err) {
          console.error('הטוקן פג תוקף או שאינו תקין, מנקים את ה-Storage');
          localStorage.removeItem('access_token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false); // מסיימים את הבדיקה ההתחלתית
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

  // טעינת נתונים רק אחרי שהמשתמש מחובר (או שוחזר בהצלחה)
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

  // --- 2. טיפול בהתחברות מוצלחת (גוגל או טופס רגיל) שמחזירה { access_token, user } ---
  const handleAuthSuccess = (authResponse: any) => {
    // שליפת הטוקן ונתוני המשתמש מתוך מבנה התשובה של השרת
    const { access_token, user: loggedInUser } = authResponse;

    // שמירת הטוקן בדפדפן בשביל ה-"זכור אותי" לפעמים הבאות
    localStorage.setItem('access_token', access_token);
    
    // הזרקת הטוקן לכל הבקשות הבאות של axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

    setUser(loggedInUser); // מעדכן את הסטייט ופותח את האתר
  };

  // מנוע הסינון הקיים...
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

  // מסך ביניים בזמן שהאפליקציה בודקת מול השרת אם המשתמש כבר מחובר (מונע "קפיצה" של מסך הלוגין)
  if (isLoading && !user) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh', bgcolor: '#f7f9f6' }}>
        <CircularProgress color="success" size={50} />
        <Typography sx={{ mt: 2 }} color="text.secondary" fontWeight={500}>מתחבר לחממה...</Typography>
      </Stack>
    );
  }

  // --- הגנת כניסה: אם המשתמש לא מחובר, מראים רק את דף הכניסה ---
  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9f6', pb: 8 }}>
      <Header 
        cartItemsCount={cartItemsCount} 
        onCartClick={() => setView('cart')} 
        // --- 3. התנתקות מכוונת וניקוי ה-Storage לחלוטין ---
        onLogout={() => {
          localStorage.removeItem('access_token');            // מוחק את הזיכרון מהדפדפן
          delete axios.defaults.headers.common['Authorization']; // מסיר את ה-Token מ-axios
          setUser(null);                                      // מחזיר למסך הכניסה
          setView('store');                                   // מאפס תצוגה
        }} 
      />

      {view === 'cart' ? (
        <CartPage onBackToStore={() => setView('store')} onCartUpdated={handleRefreshAll} />
      ) : (
        <Container maxWidth="lg" sx={{ mt: 5 }}>
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="h4" component="h2" fontWeight={850} color="#1b3a24">
              שלום, {user.name} 🌿
            </Typography>
            <Typography variant="body1" color="text.secondary">
              השתילים האורגניים שלך מחכים לך בחממה
            </Typography>
          </Stack>

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
      )}
    </Box>
  );
}

export default App;