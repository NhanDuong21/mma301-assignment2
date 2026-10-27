export const colors = {
  background: '#F5F7FA', surface: '#FFFFFF', text: '#172B4D', muted: '#52637A',
  primary: '#2057D4', border: '#DFE5EF', danger: '#B42318', success: '#16794A',
};

// DummyJSON prices are USD. Do not relabel them as VND without conversion.
export const money = (value) => `$${Number(value).toFixed(2)}`;
