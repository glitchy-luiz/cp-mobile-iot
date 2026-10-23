export interface AppColors {
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  success: string;
  danger: string;
  warning: string;
  lampOn: string;
}

export const lightColors: AppColors = {
  background: '#EEF3F5',
  surface: '#FFFFFF',
  border: '#D5E0E5',
  text: '#10212B',
  textMuted: '#5B707C',
  primary: '#0B6E8A',
  onPrimary: '#FFFFFF',
  success: '#1B7F4B',
  danger: '#B3261E',
  warning: '#9A6700',
  lampOn: '#F5B301',
};

export const darkColors: AppColors = {
  background: '#0D1519',
  surface: '#16222A',
  border: '#27383F',
  text: '#E4EEF2',
  textMuted: '#8FA6B2',
  primary: '#48C2E3',
  onPrimary: '#06232C',
  success: '#5FD39A',
  danger: '#FF8A80',
  warning: '#F0B84A',
  lampOn: '#FFC933',
};
