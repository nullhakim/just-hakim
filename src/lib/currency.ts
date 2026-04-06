export const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export const parseRupiahInput = (value: string): string => {
  return value.replace(/[^0-9]/g, "");
};

export const formatRupiahInput = (value: string): string => {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  return new Intl.NumberFormat("id-ID").format(Number(num));
};
