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
type SerializedScheme = { [name: string]: Rgb };
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

const colorToRgb = (color: DynamicColor, scheme: DynamicScheme): Rgb => {
    const argb = color.getArgb(scheme);
    const rgba = rgbaFromArgb(argb);
    return `${rgba.r} ${rgba.g} ${rgba.b}`;
};

const serializeDynamicScheme = (scheme: DynamicScheme): SerializedScheme => {
    const colorNames = Object.entries(MaterialDynamicColors)
        .filter((entry) => entry[1] instanceof DynamicColor)
        .map(([key]) => key as keyof MaterialDynamicColors);
    return Object.fromEntries(colorNames.map((name) => [name, colorToRgb(MaterialDynamicColors[name], scheme)]));
};

const toKebabCase = (name: string) =>
    name.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($1, $2) => ($2 ? '-' : '') + $1).toLowerCase();

const serializedSchemetoCss = (scheme: SerializedScheme, prefix: string): string =>
    Object.entries(scheme)
        .map(([name, rgb]) => `--${prefix}-color-${toKebabCase(name)}: ${rgb};`)
        .join(' ');

export const updateStyleSheet = async (
    source?: ColorSource,
    darkMode = false,
    contrast = 0,
    schemeType = 'content',
    cssPrefix = 'sm3-scheme'
) => {
    let dynamicScheme;
    if (source instanceof DynamicScheme) dynamicScheme = source;
    else {
        let argbSource;
        if (typeof source === 'number') argbSource = source;
        else if (typeof source === 'string') argbSource = argbFromHex(source);
        else if (source instanceof HTMLImageElement) argbSource = await sourceColorFromImage(source);
        else return;
        source = hexFromArgb(argbSource);
        const scheme = schemeTypes[schemeType] ?? SchemeContent;
        dynamicScheme = new scheme(Hct.fromInt(argbSource), darkMode, contrast);
    }
    // Convert scheme to css and load into adopted stylesheets
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(`
		:root {
			color-scheme: ${darkMode ? 'dark' : 'light'};
			${serializedSchemetoCss(serializeDynamicScheme(dynamicScheme), cssPrefix)}
		}`);
    document.adoptedStyleSheets = [styleSheet];
    return source;
};
