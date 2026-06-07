import { createTheme } from '@mantine/core';

export const theme = createTheme({
    primaryColor: 'brandGreen',
    colors: {
        brandGreen: [
            "#e8f5ec",
            "#d1ebd9",
            "#a3d7b4",
            "#75c28e",
            "#47ae69",
            "#2e6f40", // main primary brand color
            "#255933",
            "#1c4326",
            "#132c19",
            "#0a160d"
        ],
        brandLime: [
            "#fbffe3",
            "#f6ffb8",
            "#f0ff8c",
            "#ebff61",
            "#e6ff36",
            "#dfff00", // main secondary accent color
            "#dfff00", // filled / outline background color
            "#ccfa00", // active / hover color
            "#b2cc00",
            "#869900"
        ],
        darkBackground: [
            "#0d1610",
            "#132218",
            "#192e20",
            "#1f3a28",
            "#254630",
            "#2b5238",
            "#315e40",
            "#376a48",
            "#3d7650",
            "#438258"
        ]
    },
    fontFamily: 'Outfit, Inter, sans-serif',
    headings: {
        fontFamily: 'Outfit, Inter, sans-serif',
        sizes: {
            h1: { fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.2' },
            h2: { fontSize: '2rem', fontWeight: '700', lineHeight: '1.3' },
            h3: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.4' },
        }
    },
    components: {
        Button: {
            defaultProps: {
                radius: 'md',
            },
            styles: (theme: any) => ({
                root: {
                    transition: 'all 0.2s ease',
                    fontWeight: 600,
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(46, 111, 64, 0.2)',
                    }
                }
            })
        },
        Card: {
            defaultProps: {
                radius: 'lg',
                withBorder: true,
            },
            styles: () => ({
                root: {
                    background: 'rgba(20, 34, 23, 0.4)',
                    backdropFilter: 'blur(8px)',
                    borderColor: 'rgba(46, 111, 64, 0.2)',
                    color: '#fff',
                }
            })
        }
    }
});