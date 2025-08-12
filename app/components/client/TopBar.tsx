'use client';
import Link from 'next/link';
export default function TopBar() {
    return (
        <div
            style={{
                width: '100%',
                background: '#db6403ff',
                color: '#000000ff',
                padding: '10px 0 10px 10px',
                fontSize: '2rem',
                fontWeight: 'bold',
                zIndex: 100,
                fontFamily: 'Montserrat, Arial, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', // <-- This aligns children left/right
            }}
        >
            <span>
                NBA-Guess:
                <Link
                    href="/"
                    style={{
                        color: '#000000ff',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        marginRight: '16px',
                    }}
                >
                    Daily
                </Link>
                /
                <a
                    href="/random"
                    style={{
                        color: '#000000ff',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        marginLeft: '16px',
                    }}
                >
                    Random
                </a>
            </span>
            <button
                style={{
                    marginRight: '18px',
                    padding: '8px 20px',
                    background: '#000000ff',
                    color: '#db6403ff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                }}
                onClick={() => window.location.href = '/faq'} 
            >
                FAQ
            </button>
        </div>
    )
}