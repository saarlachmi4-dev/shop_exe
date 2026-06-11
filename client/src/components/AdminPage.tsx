import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, IconButton, 
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, 
  Stack, Select, MenuItem, FormControl, Divider 
} from '@mui/material';
import { Delete, Plus, ClipboardList, Leaf } from 'lucide-react';
import axios from 'axios';

interface AdminPageProps {
  onBackToStore: () => void;
  userRole?: string; 
}

export function AdminPage({ onBackToStore, userRole }: AdminPageProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [openModal, setOpenModal] = useState(false);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [season, setSeason] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (userRole === 'admin') {
      loadProducts();
      loadOrders();
    }
  }, [userRole]);

  if (userRole !== 'admin') {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 5, borderRadius: 3 }}>
          <Typography variant="h5" color="error" fontWeight="bold" gutterBottom>
            אין לך הרשאה מתאימה 🛑
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            עמוד זה מיועד למנהלי מערכת בלבד.
          </Typography>
          <Button variant="contained" color="success" onClick={onBackToStore}>
            חזרה לחנות 🌿
          </Button>
        </Paper>
      </Container>
    );
  }

  const loadProducts = async () => {
    const res = await axios.get('http://127.0.0.1:3000/products');
    setProducts(res.data);
  };

  const loadOrders = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:3000/orders/admin/all');
      setOrders(res.data);
    } catch (err) {
      console.error('שגיאה בטעינת הזמנות אדמין', err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('האם למחוק מוצר זה?')) {
      await axios.delete(`http://127.0.0.1:3000/products/${id}`);
      loadProducts();
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await axios.patch(`http://127.0.0.1:3000/orders/admin/${orderId}/status`, { status: newStatus });
      alert('הסטטוס עודכן בהצלחה!');
      loadOrders(); 
    } catch (err) {
      alert('שגיאה בעדכון הסטטוס');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('season', season);
    formData.append('stock', stock);
    if (imageFile) formData.append('image', imageFile);

    await axios.post('http://127.0.0.1:3000/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setOpenModal(false);
    loadProducts();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, direction: 'rtl' }}>
      <Typography variant="h4" fontWeight={850} color="#1b3a24" sx={{ mb: 1 }}>
        ניהול ובקרת חממה (אדמין) ⚙️
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        כאן תוכל לנהל את מלאי השתילים ולנטר הזמנות לקוחות בזמן אמת.
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button 
          variant={activeTab === 'products' ? 'contained' : 'outlined'} 
          color="success" 
          startIcon={<Leaf size={18} />}
          onClick={() => setActiveTab('products')}
        >
          ניהול מוצרים ומלאי
        </Button>
        <Button 
          variant={activeTab === 'orders' ? 'contained' : 'outlined'} 
          color="success" 
          startIcon={<ClipboardList size={18} />}
          onClick={() => setActiveTab('orders')}
        >
          ניטור הזמנות לקוחות ({orders.length})
        </Button>
        <Button variant="outlined" onClick={onBackToStore} sx={{ marginRight: 'auto !important' }}>
          חזרה לחנות 🌿
        </Button>
      </Stack>

      <Divider sx={{ mb: 4 }} />

      {activeTab === 'products' && (
        <>
          <Button variant="contained" color="primary" startIcon={<Plus size={18} />} onClick={() => setOpenModal(true)} sx={{ mb: 3 }}>
            הוסף שתיל חדש לקטלוג
          </Button>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f1f5f1' }}>
                <TableRow>
                  <TableCell align="right">שם השתיל</TableCell>
                  <TableCell align="right">מחיר</TableCell>
                  <TableCell align="right">עונה</TableCell>
                  <TableCell align="right">מלאי</TableCell>
                  <TableCell align="center">פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{product.name}</TableCell>
                    <TableCell align="right">₪{product.price}</TableCell>
                    <TableCell align="right">{product.season}</TableCell>
                    <TableCell align="right">{product.stock} יחידות</TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => handleDeleteProduct(product.id)}>
                        <Delete size={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {activeTab === 'orders' && (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f1f5f1' }}>
              <TableRow>
                <TableCell align="right">מזהה הזמנה</TableCell>
                <TableCell align="right">לקוח</TableCell>
                <TableCell align="right">פריטים</TableCell>
                <TableCell align="right">סה"כ לתשלום</TableCell>
                <TableCell align="right">סטטוס נוכחי</TableCell>
                <TableCell align="center">שינוי סטטוס</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell align="right">#{order.id}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">{order.user?.name || 'אורח'}</Typography>
                    <Typography variant="caption" color="text.secondary">{order.user?.email}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    {order.items?.map((item: any) => `${item.product?.name} (${item.quantity})`).join(', ') || 'אין פריטים'}
                  </TableCell>
                  <TableCell align="right">₪{order.totalPrice || order.total}</TableCell>
                  <TableCell align="right">
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      backgroundColor: order.status === 'בהכנה' ? '#fff3e0' : order.status === 'בדרך' ? '#e3f2fd' : '#e8f5e9',
                      color: order.status === 'בהכנה' ? '#ef6c00' : order.status === 'בדרך' ? '#1565c0' : '#2e7d32',
                      fontWeight: 'bold'
                    }}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <MenuItem value="בהכנה">בהכנה 📦</MenuItem>
                        <MenuItem value="בדרך">בדרך 🚚</MenuItem>
                        <MenuItem value="הגיעה">הגיעה ✅</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>הוספת מוצר חדש</DialogTitle>
        <form onSubmit={handleCreateProduct}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
            <TextField label="שם השתיל" fullWidth required value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="מחיר" type="number" fullWidth required value={price} onChange={(e) => setPrice(e.target.value)} />
            <TextField label="עונה" fullWidth required value={season} onChange={(e) => setSeason(e.target.value)} />
            <TextField label="מלאי ראשוני" type="number" fullWidth required value={stock} onChange={(e) => setStock(e.target.value)} />
            <Button variant="outlined" component="label">
              העלה תמונה
              <input type="file" hidden accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>ביטול</Button>
            <Button type="submit" variant="contained" color="success">שמור</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}