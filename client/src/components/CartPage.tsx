import { Box, Typography, Card, Stack, IconButton, Button, Divider, Container } from '@mui/material';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { useEffect, useState } from 'react';

type CartPageProps = {
  onBackToStore: () => void;
  onCartUpdated: () => void;
};

export function CartPage({ onBackToStore, onCartUpdated }: CartPageProps) {
  const [cart, setCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // טעינת נתוני העגלה מהשרת
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

  // עדכון כמות פריט (+ או -)
  const handleUpdateQuantity = async (cartItemId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    try {
      await axios.patch(`http://127.0.0.1:3000/cart/item/${cartItemId}`, { quantity: newQty });
      await fetchCart(); // רענון מקומי של העגלה
      onCartUpdated();   // רענון המונה ב-Header ובחנות שברקע
    } catch (error: any) {
      alert(error.response?.data?.message || 'שגיאה בעדכון הכמות');
    }
  };

  // מחיקת פריט לחלוטין מהעגלה
  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await axios.delete(`http://127.0.0.1:3000/cart/item/${cartItemId}`);
      await fetchCart();
      onCartUpdated();
    } catch (error: any) {
      alert('שגיאה במחיקת הפריט');
    }
  };

  // חישוב המחיר הכולל לתשלום
  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum: number, item: any) => sum + (Number(item.product.price) * item.quantity), 0);
  };

  if (isLoading) return <Typography sx={{ p: 4, textAlign: 'center' }}>טוען עגלה...</Typography>;

  const hasItems = cart && cart.items && cart.items.length > 0;

  return (
    <Container maxWidth="md" sx={{ mt: 5, pb: 8 }}>
      {/* כפתור חזרה לחנות */}
      <Button 
        startIcon={<ArrowLeft size={18} />} 
        onClick={onBackToStore}
        color="success"
        sx={{ mb: 3, fontWeight: 600 }}
      >
        חזרה לחנות השתילים
      </Button>

      <Typography variant="h4" fontWeight={850} color="#1b3a24" sx={{ mb: 4 }}>
        עגלת הקניות שלך
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
          {/* רשימת המוצרים בעגלה */}
          {cart.items.map((item: any) => (
            <Card 
              key={item.id} 
              sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3 }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name} 
                  style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8 }} 
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

              {/* שליטה בכמות ומחיקה */}
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
                    disabled={item.product.stock <= 0} // ננעל אם אין יותר מלאי במשתלה
                  >
                    <Plus size={16} color="#2e7d32" />
                  </IconButton>
                </Stack>

                {/* מחיר סופי לשורה */}
                <Typography variant="body1" fontWeight={700} sx={{ minWidth: 70, textAlign: 'left' }}>
                  ₪{(Number(item.product.price) * item.quantity).toFixed(2)}
                </Typography>

                {/* כפתור פח זבל */}
                <IconButton color="error" onClick={() => handleRemoveItem(item.id)}>
                  <Trash2 size={18} />
                </IconButton>
              </Stack>
            </Card>
          ))}

          <Divider sx={{ my: 2 }} />

          {/* סיכום הזמנה שורה תחתונה */}
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
              onClick={() => alert('ההזמנה בוצעה בהצלחה! השתילים בדרך אליך 🌿')}
              sx={{ borderRadius: 2.5, py: 1.5, fontWeight: 'bold', fontSize: '1.05rem' }}
            >
              אישור והמשך לתשלום
            </Button>
          </Card>
        </Stack>
      )}
    </Container>
  );
}