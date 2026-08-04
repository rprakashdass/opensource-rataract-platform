// Converts a rupee amount to Indian-format words, e.g. 125000.50 ->
// "Rupees One Lakh Twenty Five Thousand and Fifty Paise only".

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return TENS[t] + (o ? ` ${ONES[o]}` : "");
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h) parts.push(`${ONES[h]} Hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" ");
}

// Indian grouping: crore, lakh, thousand, hundred.
function integerToWords(num: number): string {
  if (num === 0) return "Zero";
  const parts: string[] = [];
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;

  if (crore) parts.push(`${integerToWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (num) parts.push(threeDigits(num));
  return parts.join(" ").trim();
}

export function amountInWords(amount: number): string {
  const safe = Math.max(0, Math.round(amount * 100) / 100);
  const rupees = Math.floor(safe);
  const paise = Math.round((safe - rupees) * 100);

  const rupeeWords = `Rupees ${integerToWords(rupees)}`;
  const paiseWords = paise > 0 ? ` and ${twoDigits(paise)} Paise` : "";
  return `${rupeeWords}${paiseWords} only`;
}
