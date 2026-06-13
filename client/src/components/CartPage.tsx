import { Box, Typography, Card, Stack, IconButton, Button, Divider, Container, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { useEffect, useState } from 'react';

type CartPageProps = {
  onBackToStore: () => void;
  onCartUpdated: () => void;
  onOrderSuccess: () => void; // פרופס המעבר לעמוד הזמנות
};

export function CartPage({ onBackToStore, onCartUpdated, onOrderSuccess }: CartPageProps) {
  const [cart, setCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');

  const fetchCart = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:3000/cart');
      setCart(response.data);
    } catch (err) {
      console.error('שגיאה בטעינת העגלה', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchCart();
  }, []);

  const handleUpdateQuantity = async (cartItemId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    try {
      await axios.patch(`http://127.0.0.1:3000/cart/item/${cartItemId}`, { quantity: newQty });
      await fetchCart();
      onCartUpdated();
    } catch (error: any) {
      alert(error.response?.data?.message || 'שגיאה בעדכון הכמות');
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await axios.delete(`http://127.0.0.1:3000/cart/item/${cartItemId}`);
      await fetchCart();
      onCartUpdated();
    } catch (error: any) {
      alert('שגיאה במחיקת הפריט');
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum: number, item: any) => sum + (Number(item.product.price) * item.quantity), 0);
  };

  // פונקציית ביצוע הזמנה מעודכנת - מרוקנת עגלה ומעדכנת מלאי
  const handleCheckout = async () => {
    if (!cart || !cart.items || cart.items.length === 0) return;

    try {
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // מיפוי הפריטים עבור ה-Backend
      const itemsToOrder = cart.items.map((item: any) => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      // 1. שמירת ההזמנה ב-Backend
      await axios.post('http://127.0.0.1:3000/orders', { items: itemsToOrder }, config);

      // 2. ריקון העגלה באופן מיידי בפרונטאנד (חוויית משתמש חלקה)
      setCart({ items: [] });

      // 3. ניסיון ריקון העגלה גם בדאטהבייס בשרת
      try {
        await axios.delete('http://127.0.0.1:3000/cart/clear', config);
      } catch (e) {
        console.log("אנדפוינט /cart/clear חסר או שונה, ממשיך הלאה");
      }

      // 4. ריענון כל הנתונים ב-App.tsx (טוען מחדש מוצרים עם המלאי המעודכן ומאפס את המונה ב-Navbar)
      await onCartUpdated();

      // 5. העברה לעמוד ההזמנות
      onOrderSuccess();
    } catch (err: any) {
      console.error('ביצוע ההזמנה נכשל', err);
      alert(err.response?.data?.message || 'התרחשה שגיאה במהלך שמירת ההזמנה. נסה שנית.');
    }
  };

  const getSortedItems = () => {
    if (!cart || !cart.items) return [];
    
    return [...cart.items].sort((a: any, b: any) => {
      if (sortBy === 'price-asc') return Number(a.product.price) - Number(b.product.price);
      if (sortBy === 'price-desc') return Number(b.product.price) - Number(a.product.price);
      if (sortBy === 'name-asc') return a.product.name.localeCompare(b.product.name, 'he');
      if (sortBy === 'qty-desc') return b.quantity - a.quantity;
      return 0;
    });
  };

  if (isLoading) return <Typography sx={{ p: 4, textAlign: 'center' }}>טוען עגלה...</Typography>;

  const hasItems = cart && cart.items && cart.items.length > 0;
  const sortedItems = getSortedItems();

  return (
    <Container maxWidth="md" sx={{ mt: 5, pb: 8, direction: 'rtl' }}>
      <Button 
        startIcon={<ArrowLeft size={18} style={{ marginLeft: 8 }} />} 
        onClick={onBackToStore}
        color="success"
        sx={{ mb: 3, fontWeight: 600 }}
      >
        חזרה לחנות השתילים
      </Button>

      <Typography variant="h4" fontWeight={850} color="#1b3a24" sx={{ mb: 4 }}>
        עגלת הקניות שלך 🛒
      </Typography>

      {!hasItems ? (
        <Card sx={{ p: 5, textAlign: 'center', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <ShoppingBag size={48} color="#9ccc65" style={{ marginBottom: 16 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            העגלה שלך ריקה כרגע...
          </Typography>
          <Button variant="contained" color="success" onClick={onBackToStore} sx={{ borderRadius: 2 }}>
            בוא נבחר כמה שתילים!
          </Button>
        </Card>
      ) : (
        <Stack spacing={3}>
          
          {/* שורת כלי מיון */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', bgcolor: '#ffffff', p: 1.5, borderRadius: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>מיין פריטים בעגלה</InputLabel>
              <Select
                label="מיין פריטים בעגלה"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="default">סדר הוספה לעגלה</MenuItem>
                <MenuItem value="price-asc">מחיר מוצר: מהנמוך לגבוה ↑</MenuItem>
                <MenuItem value="price-desc">מחיר מוצר: מהגבוה לנמוך ↓</MenuItem>
                <MenuItem value="qty-desc">כמות מוזמנת: מהגבוה לנמוך</MenuItem>
                <MenuItem value="name-asc">שם המוצר: א' - ב'</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* רשימת המוצרים */}
          {sortedItems.map((item: any) => (
            <Card 
              key={item.id} 
              sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3 }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name} 
                  style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, marginLeft: 16 }} 
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {item.product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ₪{Number(item.product.price).toFixed(2)} ליחידה
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={3}>
                <Stack direction="row" alignItems="center" sx={{ bgcolor: '#f4f6f4', borderRadius: 2, p: 0.5 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} color="#2e7d32" />
                  </IconButton>
                  
                  <Typography sx={{ width: 30, textAlign: 'center', fontWeight: 600 }}>
                    {item.quantity}
                  </Typography>
                  
                  <IconButton 
                    size="small" 
                    onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                    disabled={item.product.stock <= 0}
                  >
                    <Plus size={16} color="#2e7d32" />
                  </IconButton>
                </Stack>

                <Typography variant="body1" fontWeight={700} sx={{ minWidth: 70, textAlign: 'left' }}>
                  ₪{(Number(item.product.price) * item.quantity).toFixed(2)}
                </Typography>

                <IconButton color="error" onClick={() => handleRemoveItem(item.id)}>
                  <Trash2 size={18} />
                </IconButton>
              </Stack>
            </Card>
          ))}

          <Divider sx={{ my: 2 }} />

          {/* סיכום הרכישה */}
          <Card sx={{ p: 3, borderRadius: 3, bgcolor: '#f1f5f0' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#1b3a24">
                סה"כ לתשלום:
              </Typography>
              <Typography variant="h5" fontWeight={850} color="success.main">
                ₪{calculateTotal().toFixed(2)}
              </Typography>
            </Stack>
            
            <Button 
              fullWidth 
              variant="contained" 
              color="success" 
              size="large"
              onClick={handleCheckout}
              sx={{ borderRadius: 2.5, py: 1.5, fontWeight: 'bold', fontSize: '1.05rem' }}
            >
              בצע הזמנה עכשיו 🌿
            </Button>
          </Card>
        </Stack>
      )}
    </Container>
  );
}