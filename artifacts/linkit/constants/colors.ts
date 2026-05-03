const colors = {
  light: {
    text: "#2A2520",
    tint: "#6B8AE8",

    background: "#FBF6EC",
    foreground: "#2A2520",

    card: "#FFFFFF",
    cardForeground: "#2A2520",

    primary: "#6B8AE8",
    primaryForeground: "#FFFFFF",

    accent: "#EC85B7",
    accentForeground: "#FFFFFF",

    secondary: "#EAE3FB",
    secondaryForeground: "#5A4A8A",

    muted: "#F2EADA",
    mutedForeground: "#8A7E6E",

    destructive: "#E5634D",
    destructiveForeground: "#FFFFFF",

    border: "#EADFC8",
    input: "#EADFC8",

    gradientStart: "#6B8AE8",
    gradientEnd: "#EC85B7",

    paperCream: "#FBF6EC",
    paperWhite: "#FFFEF8",
    inkBrown: "#5C4A36",
    highlightYellow: "#FFE76A",
    softMint: "#BDEBD8",
    softPink: "#F8C9DC",
    softLavender: "#D8CBF5",
    softBlue: "#C8D6F6",
    bookRed: "#F46A6A",
    bookMint: "#7FD8B8",
    bookYellow: "#FFD86B",
    bookLavender: "#B8A6EE",
    bookBlue: "#8FB0F0",
    bookOrange: "#FFA76A",
    proGold: "#E2A23B",
  },
  radius: 18,
};

export type AppColors = typeof colors.light & { radius: number };

export default colors;
