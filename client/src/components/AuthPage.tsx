import { useState, useEffect } from 'react';
import { Box, Container, Card, TextField, Button, Typography, Stack, Tabs, Tab, Alert, Divider } from '@mui/material';
import { Sprout } from 'lucide-react';
import axios from 'axios';

type AuthPageProps = {
  onAuthSuccess: (authData: { access_token: string; user: { id: number; name: string; email: string } }) => void;
};

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [tabIndex, setTabIndex] = useState(0); // 0 = התחברות, 1 = הרשמה
  
  // שדות טופס
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // ניהול שגיאות והצלחות
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. פונקציית הגשת הטופס הרגיל
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (tabIndex === 0) {
        // --- תהליך התחברות ---
        const response = await axios.post('http://127.0.0.1:3000/auth/login', { email, password });
        onAuthSuccess(response.data); 
      } else {
        // --- תהליך הרשמה ---
        await axios.post('http://127.0.0.1:3000/auth/register', { name, email, password });
        setSuccessMessage('נרשמת בהצלחה! מעביר אותך להתחברות...');
        setTimeout(() => {
          setTabIndex(0);
          setSuccessMessage('');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'התרחשה שגיאה בתקשורת עם השרת');
    }
  };

  // 2. ה-useEffect של גוגל - יושב בצורה תקינה ישירות בגוף הקומפננטה!
  useEffect(() => {
    /* global google */
    const handleGoogleCredentialResponse = async (response: any) => {
      try {
        const idToken = response.credential;
        const backendResponse = await axios.post('http://127.0.0.1:3000/auth/google', {
          token: idToken,
        });
        onAuthSuccess(backendResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'התחברות עם גוגל נכשלה');
      }
    };

    if ((window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: "796592562943-gilp0qrs6g9sfeotifeaj5mqdta1dteq.apps.googleusercontent.com", 
        callback: handleGoogleCredentialResponse,
      });

      (window as any).google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", width: "100%", text: "signin_with" }
      );
    }
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: '#f7f9f6', py: 4 }}>
      <Container maxWidth="xs">
        <Card sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          
          {/* לוגו המשתלה */}
          <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Sprout color="#2e7d32" size={42} />
            <Typography variant="h5" fontWeight={800} color="success.main">
              משתלת הנבט הירוק
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ברוכים הבאים לחממת הלמידה והשתילים שלנו
            </Typography>
          </Stack>

          {/* בחירה בין התחברות להרשמה */}
          <Tabs 
            value={tabIndex} 
            onChange={(_, newValue) => { setTabIndex(newValue); setError(''); }} 
            variant="fullWidth" 
            textColor="primary"
            indicatorColor="primary"
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="התחברות" sx={{ fontWeight: 600 }} />
            <Tab label="הרשמה לחנות" sx={{ fontWeight: 600 }} />
          </Tabs>

          {/* הודעות שגיאה או הצלחה */}
          {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'right' }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mb: 2, textAlign: 'right' }}>{successMessage}</Alert>}

          {/* הטופס הדינמי */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              {tabIndex === 1 && (
                <TextField
                  fullWidth
                  label="שם מלא"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}
              
              <TextField
                fullWidth
                label="כתובת אימייל"
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <TextField
                fullWidth
                label="סיסמה"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="success"
                size="large"
                sx={{ borderRadius: 2.5, py: 1.2, fontWeight: 'bold', fontSize: '1rem', mt: 1 }}
              >
                {tabIndex === 0 ? 'כניסה לחנות' : 'הרשמה וסיום'}
              </Button>
            </Stack>
          </form>

          {/* 👇 המפריד והכפתור של גוגל במקומם הנכון מחוץ לטופס */}
          <Divider sx={{ my: 3 }}>או</Divider>
          <Box id="googleBtn" sx={{ display: 'flex', justifyContent: 'center' }} />

        </Card>
      </Container>
    </Box>
  );
}