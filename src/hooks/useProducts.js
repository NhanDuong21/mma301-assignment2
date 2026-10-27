import { useEffect, useRef, useState } from 'react';
import { getProducts } from '../services/productService';
import { mergeProducts } from '../domain/products';
export default function useProducts(query) {
  const [state, setState] = useState({ products: [], loading: true, refreshing: false, error: '', hasMore: false });
  const generation = useRef(0);
  const active = useRef(null);
  const busy = useRef(false);
  const offset = useRef(0);
  const more = useRef(false);
  const failed = useRef(false);
  const load = async (reset = false, refresh = false) => {
    if (!reset && (busy.current || !more.current)) return;
    if (reset) { generation.current += 1; active.current?.abort(); offset.current = 0; }
    const token = generation.current;
    const controller = new AbortController();
    active.current = controller;
    busy.current = true;
    failed.current = false;
    setState((s) => ({ ...s, products: reset && !refresh ? [] : s.products, loading: !refresh, refreshing: refresh, error: '' }));
    try {
      const data = await getProducts({ query, skip: offset.current, signal: controller.signal });
      if (token !== generation.current) return;
      offset.current += data.received;
      more.current = data.received > 0 && offset.current < data.total;
      setState((s) => ({ products: reset ? data.products : mergeProducts(s.products, data.products), loading: false, refreshing: false, error: '', hasMore: more.current }));
    } catch (error) {
      if (token !== generation.current || controller.signal.aborted) return;
      failed.current = true;
      setState((s) => ({ ...s, loading: false, refreshing: false, error: error.message }));
    } finally { if (token === generation.current) busy.current = false; }
  };
  useEffect(() => {
    load(true);
    return () => { generation.current += 1; active.current?.abort(); busy.current = false; };
  }, [query]);
  return { ...state, refresh: () => load(true, true), retry: () => load(offset.current === 0),
    loadMore: () => { if (!failed.current) load(); } };
}
