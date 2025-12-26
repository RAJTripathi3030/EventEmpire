// Toast configuration matching EventEmpire's golden theme
export const toastConfig = {
    position: 'top-center',
    duration: 4000,
    style: {
        background: '#fff',
        color: '#4A1D1D',
        border: '1px solid #D4AF37',
        borderRadius: '8px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
    },
    success: {
        duration: 3000,
        iconTheme: {
            primary: '#D4AF37',
            secondary: '#fff',
        },
    },
    error: {
        duration: 4000,
        iconTheme: {
            primary: '#8B0000',
            secondary: '#fff',
        },
    },
    loading: {
        iconTheme: {
            primary: '#D4AF37',
            secondary: '#fff',
        },
    },
};
