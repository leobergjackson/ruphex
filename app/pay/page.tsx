import { Suspense } from 'react';
import PayPage from './PayPage';

export default function PayRoute() {
  return (
    <Suspense fallback={
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-data)', color: 'var(--accent)' }}>Cargando factura···</p>
      </div>
    }>
      <PayPage />
    </Suspense>
  );
}
