import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00ADEF',
    },
    secondary: {
      main: '#FFC107',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  overrides: {
    MuiTableCell: {
      root: {
        borderBottom: 'none',
      },
      head: {
        fontWeight: 'bold',
      },
    },
    MuiTable: {
      root: {
        borderCollapse: 'separate',
        borderSpacing: '0 10px',
      },
    },
    MuiTableSortLabel: {
      active: {
        color: '#00ADEF',
      },
    },
  },
});

export default theme;