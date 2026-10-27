import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { firebaseConfigured } from '../config';
import { ensureSession, firebaseError, readWishlist, writeWishlist } from '../services/firebaseService';
const WishlistContext = createContext(null);
export function WishlistProvider({ children }) {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const mounted = useRef(true);
  const refresh = async () => {
    if (!firebaseConfigured || lock.current) return;
    lock.current = true;
    setLoading(true); setError('');
    try {
      const session = await ensureSession();
      if (!mounted.current) return;
      setUser(session);
      const saved = await readWishlist(session.uid);
      if (mounted.current) setItems(saved);
    } catch (cause) { if (mounted.current) setError(firebaseError(cause)); }
    finally { lock.current = false; if (mounted.current) setLoading(false); }
  };
  useEffect(() => { mounted.current = true; refresh(); return () => { mounted.current = false; }; }, []);
  const toggle = async (product) => {
    if (lock.current) return false;
    lock.current = true; setLoading(true); setError('');
    try {
      const session = user || await ensureSession();
      const remove = items.some((item) => item.id === product.id);
      await writeWishlist(session.uid, product, remove);
      const saved = await readWishlist(session.uid);
      if (mounted.current) { setUser(session); setItems(saved); }
      return true;
    } catch (cause) { if (mounted.current) setError(firebaseError(cause)); return false; }
    finally { lock.current = false; if (mounted.current) setLoading(false); }
  };
  return <WishlistContext.Provider value={{ items, user, loading, error, configured: firebaseConfigured, refresh, toggle }}>{children}</WishlistContext.Provider>;
}
export const useWishlist = () => useContext(WishlistContext);
