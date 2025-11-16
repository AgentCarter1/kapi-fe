import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { exchangeGoogleCode } from '../../../api/endpoints/socialAuth';
import { useAppDispatch } from '../../../store/hooks';
import { setCredentials } from '../../../store/slices/authSlice';

export const AuthGoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    if (!code) {
      toast.error('Google callback code missing');
      navigate('/auth/login', { replace: true });
      return;
    }

    // Prevent duplicate exchanges for the same code (e.g., StrictMode double effect)
    const guardKey = `google_code_exchanged_${code}`;
    if (sessionStorage.getItem(guardKey) === '1') {
      // Already processed; redirect to dashboard
      navigate('/dashboard', { replace: true });
      return;
    }

    (async () => {
      try {
        const verifier = sessionStorage.getItem('google_pkce_verifier') || undefined;
        const tokens = await exchangeGoogleCode(code, verifier);
        dispatch(setCredentials(tokens));
        toast.success('Signed in with Google ✨');
        // Set guard to avoid double-submit
        sessionStorage.setItem(guardKey, '1');
        // Cleanup verifier
        sessionStorage.removeItem('google_pkce_verifier');
        navigate('/dashboard', { replace: true });
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || 'Google sign-in failed';
        toast.error(msg);
        navigate('/auth/login', { replace: true });
      }
    })();
    // Intentionally run once; dependencies are handled via guard
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600 dark:text-gray-300">Completing Google sign-in...</div>
    </div>
  );
};


