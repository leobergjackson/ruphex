'use client';

import { useEffect, useState } from 'react';

const BITSO_WALLET_URL = 'https://bitso.com/wallet';
const BITSO_HOME_URL = 'https://bitso.com';

type BitsoIntegration = {
  enabled: boolean;
  reason?: string;
  docsUrl?: string;
  balancesPreview?: Array<{
    currency: string;
    available: string;
    total: string;
  }>;
  source?: string;
};

interface BitsoPanelProps {
  visible: boolean;
  amountDisplay?: string;
}

const OFF_RAMP_STEPS = [
  'Abre Bitso e inicia sesión (o crea una cuenta en bitso.com).',
  'Ve a Cartera → Depositar y elige USDC en la red Arbitrum.',
  'Copia tu dirección de depósito desde la app de Bitso (solo aparece ahí).',
  'Envía USDC desde tu wallet a esa dirección.',
  'Convierte USDC a MXN y retira a tu CLABE vía SPEI.',
];

export default function BitsoPanel({ visible, amountDisplay }: BitsoPanelProps) {
  const [integration, setIntegration] = useState<BitsoIntegration | null>(null);

  useEffect(() => {
    if (!visible) return;

    fetch('/api/bitso-address')
      .then((response) => response.json())
      .then((data: BitsoIntegration) => setIntegration(data))
      .catch(() =>
        setIntegration({
          enabled: false,
          reason: 'Bitso API status unavailable',
          docsUrl: 'https://bitso.com/business/developers',
        }),
      );
  }, [visible]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: visible ? '1fr' : '0fr',
        opacity: visible ? 1 : 0,
        marginTop: visible ? '40px' : '0',
        transition: 'grid-template-rows 420ms ease-out, opacity 420ms ease-out, margin-top 420ms ease-out',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflow: 'hidden' }}>
        <p className="label-accent" style={{ marginBottom: '16px' }}>RETIRO A MXN</p>

        <div style={{
          borderRadius: 'var(--r-card)',
          border: '1px solid var(--border-accent)',
          background: 'var(--bg2)',
          padding: '32px',
          boxShadow: '0 0 48px rgba(200,255,0,0.08)',
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, color: 'var(--white)', letterSpacing: '-0.01em', margin: 0 }}>
            Retira tu USDC vía Bitso
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.6, marginTop: '10px', marginBottom: '24px' }}>
            {amountDisplay
              ? `Tus ${amountDisplay} USDC ya están en tu wallet. Sigue estos pasos para convertirlos a pesos mexicanos en Bitso.`
              : 'Tu USDC ya está en tu wallet. Sigue estos pasos para convertirlo a pesos mexicanos en Bitso.'}
          </p>

          <div className="divider" />

          <p className="label" style={{ marginBottom: '12px' }}>CÓMO RETIRAR VÍA BITSO</p>
          <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {OFF_RAMP_STEPS.map((step) => (
              <li key={step} style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.55 }}>
                {step}
              </li>
            ))}
          </ol>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
            <a
              href={BITSO_WALLET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', height: '44px', textDecoration: 'none' }}
            >
              Abrir Bitso → Depositar
            </a>
            <a
              href={BITSO_HOME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', height: '44px', textDecoration: 'none' }}
            >
              ¿Sin cuenta? Regístrate en Bitso
            </a>
          </div>

          {integration?.enabled && integration.balancesPreview && integration.balancesPreview.length > 0 && (
            <>
              <div className="divider" style={{ marginTop: '24px' }} />
              <div style={{
                borderRadius: 'var(--r-input)',
                border: '1px solid var(--border-accent)',
                background: 'rgba(200,255,0,0.06)',
                padding: '16px',
              }}>
                <p style={{ margin: 0, color: 'var(--accent)', fontFamily: 'var(--font-data)', fontSize: '13px', fontWeight: 600 }}>
                  Bitso API connected ✓
                </p>
                <p style={{ margin: '8px 0 12px', color: 'var(--muted)', fontSize: '13px' }}>
                  Vista previa de saldos ({integration.source ?? 'bitso'}).
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {integration.balancesPreview.map((balance) => (
                    <div key={balance.currency} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                      <span className="label">{balance.currency}</span>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '13px', color: 'var(--white)' }}>
                        {balance.available} disponible
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {integration && !integration.enabled && integration.reason && (
            <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.55, marginTop: '20px', marginBottom: 0 }}>
              {integration.reason}
              {integration.docsUrl ? (
                <>
                  {' '}
                  <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                    Ver documentación de Bitso
                  </a>
                </>
              ) : null}
            </p>
          )}
        </div>

        <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, marginTop: '24px' }}>
          Recibo no custodia fondos ni genera direcciones de depósito. La conversión a MXN y el retiro bancario se completan dentro de Bitso.
        </p>
      </div>
    </div>
  );
}
