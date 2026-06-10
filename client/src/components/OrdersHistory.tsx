import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Card, CardContent, Stack, Grid,
  Chip, Divider, Button, IconButton, Dialog, DialogTitle, DialogContent, 
  MenuItem, Select, FormControl, InputLabel, List, ListItem, ListItemText, ListItemAvatar, Avatar 
} from '@mui/material';
import { ArrowRight, Eye, X } from 'lucide-react';
import axios from 'axios';

type OrderItem = {
  id: number;
  quantity: number;
  priceAtOrder: string;
  product: {
    name: string;
    imageUrl: string;
  };
};

type Order = {
  id: number;
  totalPrice: string;
  status: 'בהכנה' | 'בדרך' | 'הגיעה';
  createdAt: string;
  items: OrderItem[];
};

type OrdersPageProps = {
  onBackToStore: () => void;
};

export function OrdersPage({ onBackToStore }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // משיכת ההזמנות מהשרת כולל ה-Token המתאים
  const fetchOrders = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('access_token'); // שימוש ב-access_token הנכון
      
      const response = await axios.get('http://127.0.0.1:3000/orders/my-orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(response.data);
    } catch (err: any) {
      console.error('שגיאה בטעינת ההזמנות', err);
      setError('לא הצלחנו לטעון את היסטוריית ההזמנות. ודא שאתה מחובר למערכת.');
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  // לוגיקת המיון של ההזמנות
  const getSortedOrders = () => {
    const sorted = [...orders];
    if (sortBy === 'date_desc') {
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (sortBy === 'date_asc') {
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    if (sortBy === 'price_desc') {
      return sorted.sort((a, b) => Number(b.totalPrice) - Number(a.totalPrice));
    }
    if (sortBy === 'price_asc') {
      return sorted.sort((a, b) => Number(a.totalPrice) - Number(b.totalPrice));
    }
    return sorted;
  };

  const getStatusChip = (status: Order['status']) => {
    const config = {
      'בהכנה': { color: 'warning' as const, label: 'בהכנה 🧺' },
      'בדרך': { color: 'info' as const, label: 'בדרך אליך 🚚' },
      'הגיעה': { color: 'success' as const, label: 'הגיעה לחממה 🎉' }
    };
    const current = config[status] || { color: 'default' as const, label: status };
    return <Chip label={current.label} color={current.color} size="small" sx={{ fontWeight: 'bold' }} />;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 8, direction: 'rtl' }}>
      
      {/* כפתור חזרה לחנות */}
      <Button 
        startIcon={<ArrowRight size={18} style={{ marginLeft: 8 }} />} 
        onClick={onBackToStore}
        color="success"
        sx={{ fontWeight: 'bold', mb: 3 }}
      >
        חזרה לחממה ולקטלוג
      </Button>

      {/* כותרת ושורת פילטרים */}
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h4" fontWeight={850} color="#1b3a24">
            היסטוריית ההזמנות שלי 📦
          </Typography>
          <Typography variant="body2" color="text.secondary">
            עקוב אחר סטטוס השתילים וההזמנות שביצעת במערכת
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4} sx={{ mt: { xs: 2, sm: 0 } }}>
          <FormControl fullWidth size="small">
            <InputLabel>מיין לפי</InputLabel>
            <Select 
              value={sortBy} 
              label="מיין לפי" 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="date_desc">תאריך: מהחדש לישן</MenuItem>
              <MenuItem value="date_asc">תאריך: מהישן לחדש</MenuItem>
              <MenuItem value="price_desc">מחיר: מהגבוה לנמוך</MenuItem>
              <MenuItem value="price_asc">מחיר: מהנמוך לגבוה</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {error && (
        <Card sx={{ p: 3, mb: 3, bgcolor: '#fdf2f2', border: '1px solid #f8b4b4', textAlign: 'center' }}>
          <Typography color="error.main" fontWeight={600}>{error}</Typography>
        </Card>
      )}

      {/* רשימת ההזמנות */}
      <Stack spacing={2}>
        {!error && getSortedOrders().length === 0 ? (
          <Card sx={{ p: 4, borderRadius: 3, textAlign: 'center', bgcolor: '#ffffff' }}>
            <Typography variant="body1" color="text.secondary">
              עדיין לא ביצעת אף הזמנה בחנות. כשהעגלה תהיה מלאה, לחץ על "בצע הזמנה"! 🌿
            </Typography>
          </Card>
        ) : (
          getSortedOrders().map((order) => (
            <Card 
              key={order.id} 
              sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)', 
                border: '1px solid #eef2ed',
                bgcolor: '#ffffff'
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid item>
                    <Typography variant="h6" fontWeight={700}>
                      הזמנה #{order.id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.createdAt).toLocaleDateString('he-IL')} | {new Date(order.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      {getStatusChip(order.status)}
                      <Typography variant="subtitle1" fontWeight={800} sx={{ mx: 2 }}>
                        ₪{Number(order.totalPrice).toFixed(2)}
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="success" 
                        size="small"
                        onClick={() => setSelectedOrder(order)}
                        sx={{ borderRadius: 2, fontWeight: 'bold' }}
                      >
                        פרטי הזמנה
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>

      {/* חלון פרטי הזמנה (Modal) */}
      <Dialog 
        open={Boolean(selectedOrder)} 
        onClose={() => setSelectedOrder(null)} 
        fullWidth 
        maxWidth="xs" 
        PaperProps={{ sx: { borderRadius: 4, direction: 'rtl' } }}
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <span>פרטי הזמנה #{selectedOrder.id}</span>
              <IconButton onClick={() => setSelectedOrder(null)} size="small">
                <X size={18} />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 3 }}>
              <Stack spacing={1.5} sx={{ mb: 3 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">סטטוס משלוח:</Typography>
                  {getStatusChip(selectedOrder.status)}
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">תאריך ביצוע:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {new Date(selectedOrder.createdAt).toLocaleDateString('he-IL')}
                  </Typography>
                </Stack>
              </Stack>

              <Typography variant="subtitle2" fontWeight={700} color="success.main" sx={{ mb: 1 }}>
                השתילים שהוזמנו:
              </Typography>

              <List disablePadding>
                {selectedOrder.items?.map((item) => (
                  <ListItem key={item.id} disableGutters sx={{ py: 1 }}>
                    <ListItemAvatar>
                      <Avatar 
                        src={item.product?.imageUrl} 
                        variant="rounded" 
                        sx={{ width: 48, height: 48, ml: 2, bgcolor: '#f0f4f0' }} 
                      />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={item.product?.name || 'מוצר שהוסר'} 
                      secondary={`כמות: ${item.quantity} יח'`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    />
                    <Typography variant="body2" fontWeight={700}>
                      ₪{(Number(item.priceAtOrder) * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={800}>סה"כ לתשלום:</Typography>
                <Typography variant="h6" fontWeight={800} color="success.main">
                  ₪{Number(selectedOrder.totalPrice).toFixed(2)}
                </Typography>
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
}