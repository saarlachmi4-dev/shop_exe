import { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton
} from '@mui/material';
import { ShoppingCart, Trash2 } from 'lucide-react';
import axios from 'axios';

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  season?: string;
};

type ProductCardProps = {
  product: Product;
  userRole?: string; // 👈 תמיכה בתפקיד המשתמש
  onAddToCartSuccess?: () => void;
  onDeleteProductSuccess?: () => void; // 👈 פונקציה לרענון הרשימה אחרי מחיקה
};

export function ProductCard({ product, userRole, onAddToCartSuccess, onDeleteProductSuccess }: ProductCardProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async () => {
    setIsSubmitting(true);
    try {
      await axios.post('http://127.0.0.1:3000/cart/add', {
        productId: product.id,
        quantity: quantity
      });

      alert(`התווסף לעגלה: ${quantity} יחידות של ${product.name}!`);

      if (onAddToCartSuccess) {
        onAddToCartSuccess();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'שגיאה בהוספת המוצר לעגלה');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 👑 אפשרות מחיקה מהירה ישירות מהחנות עבור האדמין
  const handleDeleteProduct = async () => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את ${product.name} מהקטלוג?`)) {
      try {
        await axios.delete(`http://127.0.0.1:3000/products/${product.id}`);
        alert('המוצר נמחק בהצלחה');
        if (onDeleteProductSuccess) {
          onDeleteProductSuccess();
        }
      } catch (error: any) {
        alert(error.response?.data?.message || 'שגיאה במחיקת המוצר');
      }
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        position: 'relative', // 👈 נחוץ עבור מיקום כפתור המחיקה הצף
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(46, 125, 50, 0.15)',
        }
      }}
    >
      {/* 👑 אם המשתמש הוא מנהל, נציג לו כפתור מחיקה מהיר צף על המוצר */}
      {userRole === 'admin' && (
        <IconButton
          color="error"
          onClick={handleDeleteProduct}
          sx={{
            position: 'absolute',
            top: 12,
            left: 12, // ממוקם בצד שמאל (הצד ההפוך מהתגיות)
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 5,
            '&:hover': { bgcolor: '#fff' }
          }}
        >
          <Trash2 size={18} />
        </IconButton>
      )}

      <CardMedia
        component="img"
        height="240"
        image={product.imageUrl}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <Typography variant="h6" component="h3" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {product.name}
          </Typography>
          <Chip
            label={`₪${Number(product.price).toFixed(2)}`}
            color="success"
            size="small"
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 44, lineHeight: 1.4 }}>
          {product.description}
        </Typography>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto', pt: 1 }}>
          <Chip
            label={isOutOfStock ? "אזל מהמלאי" : `${product.stock} יחידות במלאי`}
            color={isOutOfStock ? "error" : "default"}
            size="small"
            variant="outlined"
          />

          {!isOutOfStock && (
            <Stack direction="row" alignItems="center" sx={{ bgcolor: '#f4f6f4', borderRadius: 2, p: 0.5 }}>
              <Button
                size="small"
                onClick={() => setQuantity((prev) => Math.max(1, Number(prev) - 1))}
                disabled={Number(quantity) <= 1}
                sx={{ minWidth: 32, p: 0.5, fontWeight: 'bold', color: '#2e7d32' }}
              >
                -
              </Button>

              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity === 0 ? '' : quantity}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setQuantity(0);
                    return;
                  }
                  const numVal = Number(val);
                  if (numVal <= product.stock) {
                    setQuantity(numVal);
                  } else {
                    setQuantity(product.stock);
                  }
                }}
                onBlur={() => {
                  if (quantity < 1) {
                    setQuantity(1);
                  }
                }}
                style={{
                  width: '55px',
                  textAlign: 'center',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />

              <Button
                size="small"
                onClick={() => setQuantity((prev) => Math.min(product.stock, Number(prev) + 1))}
                disabled={Number(quantity) >= product.stock}
                sx={{ minWidth: 32, p: 0.5, fontWeight: 'bold', color: '#2e7d32' }}
              >
                +
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          color="success"
          disabled={isOutOfStock || isSubmitting}
          onClick={handleAddToCart}
          startIcon={<ShoppingCart size={18} />}
          sx={{ borderRadius: 2, py: 1, fontWeight: 600, textTransform: 'none' }}
        >
          {isOutOfStock ? 'אזל מהמלאי' : isSubmitting ? 'מוסיף...' : 'הוסף לעגלה'}
        </Button>
      </CardActions>
    </Card>
  );
}