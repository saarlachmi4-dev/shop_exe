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
  MenuItem,
  TextField
} from '@mui/material';
import { ShoppingCart } from 'lucide-react';
import axios from 'axios';

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
};

type ProductCardProps = {
  product: Product;
  onAddToCartSuccess?: () => void; // פונקציה שתופעל כדי לעדכן את העגלה למעלה אחרי ההוספה
};

export function ProductCard({ product, onAddToCartSuccess }: ProductCardProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async () => {
    setIsSubmitting(true);
    try {
      // שליחת הבקשה ל-NestJS API החדש שלנו
      await axios.post('http://127.0.0.1:3000/cart/add', {
        productId: product.id,
        quantity: quantity
      });
      
      alert(`התווסף לעגלה: ${quantity} יחידות של ${product.name}!`);
      
      if (onAddToCartSuccess) {
        onAddToCartSuccess(); // קריאה לרענון מונה העגלה ב-Header
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'שגיאה בהוספת המוצר לעגלה');
    } finally {
      setIsSubmitting(false);
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
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(46, 125, 50, 0.15)',
        }
      }}
    >
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
          
        {/* בחירת כמות משולבת: כפתורים + הקלדה חופשית גמישה */}
        {!isOutOfStock && (
        <Stack direction="row" alignItems="center" sx={{ bgcolor: '#f4f6f4', borderRadius: 2, p: 0.5 }}>
            {/* כפתור מינוס */}
            <Button
            size="small"
            onClick={() => setQuantity((prev) => Math.max(1, Number(prev) - 1))}
            disabled={Number(quantity) <= 1}
            sx={{ minWidth: 32, p: 0.5, fontWeight: 'bold', color: '#2e7d32' }}
            >
            -
            </Button>
            
            {/* שדה הקלדה חופשית גמיש - מאפשר מחיקה זמנית */}
            <input
                type="number"
                min="1" // <-- חוסם את החץ המובן של הדפדפן מלרדת מתחת ל-1
                max={product.stock} // <-- חוסם את החץ המובנה של הדפדפן מלעבור את המלאי
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
                    width: '55px', // הגדלתי מעט ל-55px כדי שיהיה מקום גם למספר וגם לחצים בצד
                    textAlign: 'center',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '1rem',
                    fontWeight: 600,
                    outline: 'none',
                    // מחקנו את ה-Appearance כדי שהחצים יחזרו להופיע!
                }}
            />

            {/* כפתור פלוס */}
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