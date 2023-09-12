export type TypeOption = 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';
export type IconTypeOption = 'filled' | 'tonal' | 'outlined' | 'standard';
export const FABTypeOptions = <const>['primary', 'surface', 'secondary', 'tertiary'];
export type FABTypeOption = (typeof FABTypeOptions)[number];
export type FABOption = boolean | 'small' | 'medium' | 'large';
export type ButtonColorOptions = { text?: string; background?: string };

export type ProgressColorOptions = { indicator?: string; track?: string };
export type Linecap = 'butt' | 'round' | 'square';

export type SnackbarColorOptions = {
    text?: string;
    action?: string;
    background?: string;
};

type SwitchState = { checked?: string; unchecked?: string };
export type SwitchColorOptions = {
    foreground?: SwitchState;
    background?: SwitchState;
};
