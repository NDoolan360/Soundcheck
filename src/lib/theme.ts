import {
    DynamicColor,
    DynamicScheme,
    Hct,
    MaterialDynamicColors,
    SchemeContent,
    SchemeExpressive,
    SchemeFidelity,
    SchemeMonochrome,
    SchemeNeutral,
    SchemeTonalSpot,
    SchemeVibrant,
    argbFromHex,
    hexFromArgb,
    rgbaFromArgb,
    sourceColorFromImage,
} from '@material/material-color-utilities';

type Rgb = `${number} ${number} ${number}`;
export type ColorSource = string | DynamicScheme | number | HTMLImageElement;
export type SchemeType =
    | typeof SchemeMonochrome
    | typeof SchemeNeutral
    | typeof SchemeTonalSpot
    | typeof SchemeVibrant
    | typeof SchemeExpressive
    | typeof SchemeFidelity
    | typeof SchemeContent
    | undefined;

const schemeTypes: { [name: string]: SchemeType } = {
    monochrome: SchemeMonochrome,
    neutral: SchemeNeutral,
    tonalSpot: SchemeTonalSpot,
    vibrant: SchemeVibrant,
    expressive: SchemeExpressive,
    fidelity: SchemeFidelity,
    content: SchemeContent,
};

export const colorToRgb = (color: DynamicColor, scheme: DynamicScheme): Rgb => {
    const argb = color.getArgb(scheme);
    const rgba = rgbaFromArgb(argb);
    return `${rgba.r} ${rgba.g} ${rgba.b}`;
};

export const toKebabCase = (name: string) =>
    name.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($1, $2) => ($2 ? '-' : '') + $1).toLowerCase();

export const dynamicSchemeToCss = (scheme: DynamicScheme, prefix: string): string =>
    Object.entries(MaterialDynamicColors)
        .filter((entry) => entry[1] instanceof DynamicColor)
        .map(([key]) => {
            const name = key as keyof MaterialDynamicColors;
            return `--${prefix}-color-${toKebabCase(name)}: ${colorToRgb(MaterialDynamicColors[name], scheme)};`;
        })
        .join(' ');

export const updateStyleSheet = async (
    source?: ColorSource,
    darkMode = false,
    contrast = 0,
    schemeType = 'content',
    cssPrefix = 'scheme'
) => {
    let dynamicScheme;
    let argbSource;
    if (source instanceof DynamicScheme) dynamicScheme = source;
    else if (typeof source === 'number') argbSource = source;
    else if (typeof source === 'string') argbSource = argbFromHex(source);
    else if (source instanceof HTMLImageElement) argbSource = await sourceColorFromImage(source);

    if (argbSource) {
        source = hexFromArgb(argbSource);
        const scheme = schemeTypes[schemeType] ?? SchemeContent;
        dynamicScheme = new scheme(Hct.fromInt(argbSource), darkMode, contrast);
    }

    if (dynamicScheme) {
        // Convert scheme to css and load into adopted stylesheets
        const styleSheet = new CSSStyleSheet();
        styleSheet.insertRule(`:root {
            color-scheme: ${darkMode ? 'dark' : 'light'};
            ${dynamicSchemeToCss(dynamicScheme, cssPrefix)}
        }`);
        document.adoptedStyleSheets = [styleSheet];
    }
};
