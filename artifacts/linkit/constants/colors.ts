const colors = {
  light: {
    text: "#2A2520",
    tint: "#FF8FA3",

    background: "#FBF6EC",
    foreground: "#2A2520",

    card: "#FFFFFF",
    cardForeground: "#2A2520",

    primary: "#FF8FA3",
    primaryForeground: "#FFFFFF",

    accent: "#FFD86B",
    accentForeground: "#2A2520",

    secondary: "#FFF1D6",
    secondaryForeground: "#7A5A2C",

    muted: "#F2EADA",
    mutedForeground: "#8A7E6E",

    destructive: "#E5634D",
    destructiveForeground: "#FFFFFF",

    border: "#EADFC8",
    input: "#EADFC8",

    gradientStart: "#FFB7C5",
    gradientEnd: "#FFD86B",

    paperCream: "#FBF6EC",
    paperWhite: "#FFFEF8",
    inkBrown: "#5C4A36",
    highlightYellow: "#FFE76A",
    softMint: "#BDEBD8",
    softPink: "#FFD3DA",
    softLavender: "#E0D4F7",
    softBlue: "#CFE6FB",
    bookRed: "#F46A6A",
    bookMint: "#7FD8B8",
    bookYellow: "#FFD86B",
    bookLavender: "#C9B6F2",
    bookBlue: "#8FB8F0",
    bookOrange: "#FFA76A",
    proGold: "#E2A23B",
  },
  radius: 18,
};

export type AppColors = typeof colors.light & { radius: number };

export default colors;
