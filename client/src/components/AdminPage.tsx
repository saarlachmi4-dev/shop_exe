import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, IconButton, 
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, 
  Stack, Select, MenuItem, FormControl, InputLabel, Divider, CircularProgress 
} from '@mui/material';
import { Delete, Edit, Plus, ClipboardList, Leaf } from 'lucide-react';
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
  
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [season, setSeason] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState(''); 
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(''); 
  const [isUploading, setIsUploading] = useState(false);

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
          <Button variant="contained" color="success" onClick={onBackToStore}>
            חזרה לחנות 🌿
          </Button>
        </Paper>
      </Container>
    );
  }

  const loadProducts = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:3000/products');
      setProducts(res.data);
    } catch (err) {
      console.error('שגיאה בטעינת מוצרים', err);
    }
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
      try {
        await axios.delete(`http://127.0.0.1:3000/products/${id}`);
        loadProducts();
      } catch (err) {
        console.error('שגיאה במחיקת מוצר', err);
      }
    }
  };

  const handleOpenEditModal = (product: any) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setSeason(product.season || ''); 
    setStock(product.stock.toString());
    setDescription(product.description || '');
    setCurrentImageUrl(product.imageUrl || product.image || ''); 
    setImageFile(null); 
    setOpenModal(true);
  };

  const handleOpenCreateModal = () => {
    setEditingProductId(null);
    setName('');
    setPrice('');
    setSeason('');
    setStock('');
    setDescription('');
    setCurrentImageUrl('');
    setImageFile(null);
    setOpenModal(true);
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

 const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // 🟢 הגנת תמונה: ברירת המחדל היא הכתובת הקיימת של התמונה!
      let imageUrl = currentImageUrl; 

      // העלאה ל-Cloudinary תתבצע אך ורק אם המשתמש בחר קובץ חדש במודאל
      if (imageFile) {
        const cloudinaryForm = new FormData();
        cloudinaryForm.append('file', imageFile);
        cloudinaryForm.append('upload_preset', 'ml_default'); 
        const cloudName = 'dvztvlbdd'; 

        const cloudinaryResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, 
          cloudinaryForm,
          { 
            // 🔥 התיקון לבעיית ה-CORS: מחיקת ה-Authorization כדי ש-Cloudinary לא יחסום את הבקשה
            headers: {
              Authorization: undefined
            },
            transformRequest: [(data) => data] 
          } 
        );

        imageUrl = cloudinaryResponse.data.secure_url; 
      }

      // 🛠️ התאמה בין ה-Frontend ל-Backend: שולחים גם image וגם imageUrl כדי שגם יצירה וגם עריכה יעבדו תקין
      const productPayload = {
        name,
        price: Number(price),
        season,
        stock: Number(stock),
        description,
        image: imageUrl,    // עבור העריכה
        imageUrl: imageUrl  // עבור פונקציית ה-create ב-Backend
      };

      if (editingProductId) {
        await axios.put(`http://127.0.0.1:3000/products/${editingProductId}`, productPayload);
        alert('המוצר עודכן בהצלחה! 🎉');
      } else {
        await axios.post('http://127.0.0.1:3000/products', productPayload);
        alert('המוצר נוצר בהצלחה! 🎉');
      }
      
      setOpenModal(false);
      loadProducts();
    } catch (err) {
      console.error('שגיאה בתהליך שמירת המוצר', err);
      alert('הפעולה נכשלה, בדוק את נתוני השרת או ה-Console.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, direction: 'rtl' }}>
      <Typography variant="h4" fontWeight={850} color="#1b3a24" sx={{ mb: 1 }}>
        ניהול ובקרת חממה (אדמין) ⚙️
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
          ניהול הזמנות לקוחות ({orders.length})
        </Button>
        <Button variant="outlined" onClick={onBackToStore} sx={{ marginRight: 'auto !important' }}>
          חזרה לחנות 🌿
        </Button>
      </Stack>

      <Divider sx={{ mb: 4 }} />

      {activeTab === 'products' && (
        <>
          <Button variant="contained" color="primary" startIcon={<Plus size={18} />} onClick={handleOpenCreateModal} sx={{ mb: 3 }}>
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
                      <IconButton color="primary" onClick={() => handleOpenEditModal(product)} sx={{ ml: 1 }}>
                        <Edit size={20} />
                      </IconButton>
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

      {/* טבלת הזמנות */}
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
                      <Select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
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

      {/* מודאל יצירה ועריכה */}
      <Dialog open={openModal} onClose={() => !isUploading && setOpenModal(false)}>
        <DialogTitle>{editingProductId ? 'עריכת מוצר קיים ✍️' : 'הוספת מוצר חדש 🌿'}</DialogTitle>
        <form onSubmit={handleSaveProduct}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
            <TextField label="שם השתיל" fullWidth required disabled={isUploading} value={name} onChange={(e) => setName(e.target.value)} />
            
            <TextField 
              label="תיאור השתיל" 
              fullWidth 
              multiline 
              rows={3} 
              disabled={isUploading} 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />

            <TextField label="מחיר" type="number" inputProps={{ step: "0.01" }} fullWidth required disabled={isUploading} value={price} onChange={(e) => setPrice(e.target.value)} />
            
            <FormControl fullWidth required disabled={isUploading}>
              <InputLabel id="season-select-label">עונה</InputLabel>
              <Select
                labelId="season-select-label"
                value={season}
                label="עונה"
                onChange={(e) => setSeason(e.target.value)}
              >
                {/* אופציות התואמות לסינון החנות הקיים */}
                <MenuItem value="שתיל קיץ">שתיל קיץ ☀️</MenuItem>
                <MenuItem value="שתיל חורף">שתיל חורף 🌧️</MenuItem>
                <MenuItem value="רב-עונתי">רב-עונתי 🌿</MenuItem>
                
                {/* 🛠️ תואם לאזהרות MUI: תמיכה ותאימות לאחור בערכים הישנים של בסיס הנתונים שלך כדי למנוע קריסה */}
                {season === "קיץ" && <MenuItem value="קיץ">קיץ (ערך ישן)</MenuItem>}
                {season === "חורף" && <MenuItem value="חורף">חורף (ערך ישן)</MenuItem>}
              </Select>
            </FormControl>

            <TextField label="מלאי" type="number" fullWidth required disabled={isUploading} value={stock} onChange={(e) => setStock(e.target.value)} />
            
            <Button variant="outlined" component="label" disabled={isUploading} color={imageFile ? "success" : "primary"}>
              {imageFile ? `קובץ נבחר: ${imageFile.name.substring(0, 15)}...` : 'החלף תמונה קיימת'}
              <input type="file" hidden accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </Button>
            
            {editingProductId && currentImageUrl && !imageFile && (
              <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1 }}>
                תמונת המוצר הנוכחית תישמר ללא שינוי 🖼️
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)} disabled={isUploading}>ביטול</Button>
            <Button type="submit" variant="contained" color="success" disabled={isUploading}>
              {isUploading ? <CircularProgress size={24} color="inherit" /> : 'שמור'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}