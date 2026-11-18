'use client'

const GlobalError = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => (
  <html lang='en'>
    <body
      style={{
        alignItems: 'center',
        background: '#EEF0FA',
        color: '#141B2E',
        display: 'flex',
        fontFamily: 'Inter, system-ui, sans-serif',
        justifyContent: 'center',
        margin: 0,
        minHeight: '100dvh',
        padding: '16px'
      }}
    >
      <main style={{ maxWidth: '520px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', margin: '0 0 12px' }}>SAGICAM is having a problem</h1>
        <p style={{ color: '#4A5370', lineHeight: 1.6, margin: '0 0 16px' }}>
          Please try again in a moment. If it keeps happening, contact SAGICAM at info@sagicam.org and mention the
          reference below.
        </p>
        {error.digest ? (
          <p style={{ fontFamily: 'monospace', fontSize: '13px', margin: '0 0 20px' }}>Reference: {error.digest}</p>
        ) : null}
        <button
          type='button'
          onClick={reset}
          style={{
            background: '#2447C8',
            border: 0,
            borderRadius: '8px',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 600,
            minHeight: '44px',
            padding: '10px 20px'
          }}
        >
          Try again
        </button>
      </main>
    </body>
  </html>
)

export default GlobalError
