import { Document, Page, Text, View, StyleSheet, Image, renderToBuffer } from "@react-pdf/renderer";
import { amountInWords } from "./amountInWords";

export interface ReceiptData {
  receiptNumber: string;
  date: Date;
  clubName: string;
  clubAddress?: string | null;
  clubContact?: string | null; // "email · phone"
  logo?: { data: Buffer; format: "png" | "jpg" } | null;
  payerName: string;
  amount: number;
  paymentMethod?: string | null; // CASH, UPI, ...
  referenceNumber?: string | null;
  purpose: string; // description / category / "Contribution"
  presName?: string | null;
  treasName?: string | null;
  treasSignature?: { data: Buffer; format: "png" | "jpg" } | null;
  presSignature?: { data: Buffer; format: "png" | "jpg" } | null;
}

// THADAM cranberry + gold, kept inline (react-pdf has no Tailwind).
const BRAND = "#D41367";
const INK = "#2B1F26";
const SOFT = "#5D4E56";
const HAIR = "#E7DDD9";

const styles = StyleSheet.create({
  page: { padding: 44, fontSize: 11, color: INK, fontFamily: "Helvetica", lineHeight: 1.5 },
  topBar: { height: 6, backgroundColor: BRAND, marginBottom: 20, borderRadius: 3 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  logo: { width: 54, height: 54, marginRight: 14 },
  clubName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: INK },
  clubMeta: { fontSize: 9, color: SOFT, marginTop: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: HAIR, marginVertical: 16 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", letterSpacing: 2, color: BRAND },
  metaRight: { textAlign: "right", fontSize: 9, color: SOFT },
  metaValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: INK },
  row: { flexDirection: "row", marginTop: 10 },
  label: { width: 130, color: SOFT, fontSize: 10 },
  value: { flex: 1, fontFamily: "Helvetica-Bold" },
  amountBox: {
    marginTop: 18, padding: 14, borderWidth: 1, borderColor: `${BRAND}44`,
    backgroundColor: "#FBEEF4", borderRadius: 8,
  },
  amountBig: { fontSize: 22, fontFamily: "Helvetica-Bold", color: BRAND },
  amountWords: { fontSize: 10, color: SOFT, marginTop: 4 },
  footer: { position: "absolute", bottom: 44, left: 44, right: 44 },
  sign: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40 },
  signBlock: { width: 160, alignItems: "center" },
  signImg: { width: 120, height: 40, objectFit: "contain", marginBottom: 4 },
  signName: { width: 160, borderTopWidth: 1, borderTopColor: INK, paddingTop: 4, fontSize: 10, fontFamily: "Helvetica-Bold", color: INK, textAlign: "center" },
  signRole: { fontSize: 8, color: SOFT, textAlign: "center", marginTop: 2 },
  note: { fontSize: 8, color: "#99878F", textAlign: "center", marginTop: 22 },
});

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function ReceiptDoc({ data }: { data: ReceiptData }) {
  const rs = `Rs. ${data.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const method = [data.paymentMethod, data.referenceNumber ? `Ref ${data.referenceNumber}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Document title={`Receipt ${data.receiptNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />

        <View style={styles.header}>
          {data.logo ? <Image style={styles.logo} src={{ data: data.logo.data, format: data.logo.format }} /> : null}
          <View>
            <Text style={styles.clubName}>{data.clubName}</Text>
            {data.clubAddress ? <Text style={styles.clubMeta}>{data.clubAddress}</Text> : null}
            {data.clubContact ? <Text style={styles.clubMeta}>{data.clubContact}</Text> : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.titleRow}>
          <Text style={styles.title}>RECEIPT</Text>
          <View style={styles.metaRight}>
            <Text>Receipt No.</Text>
            <Text style={styles.metaValue}>{data.receiptNumber}</Text>
            <Text style={{ marginTop: 4 }}>Date: {fmtDate(data.date)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Received with thanks from</Text>
          <Text style={styles.value}>{data.payerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Towards</Text>
          <Text style={styles.value}>{data.purpose}</Text>
        </View>
        {method ? (
          <View style={styles.row}>
            <Text style={styles.label}>Payment mode</Text>
            <Text style={styles.value}>{method}</Text>
          </View>
        ) : null}

        <View style={styles.amountBox}>
          <Text style={styles.amountBig}>{rs}</Text>
          <Text style={styles.amountWords}>{amountInWords(data.amount)}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.sign}>
            <View style={styles.signBlock}>
              {data.presSignature ? (
                <Image
                  style={styles.signImg}
                  src={{ data: data.presSignature.data, format: data.presSignature.format }}
                />
              ) : null}
              <Text style={styles.signName}>{data.presName || "For the Club"}</Text>
              <Text style={styles.signRole}>President</Text>
            </View>
            <View style={styles.signBlock}>
              {data.treasSignature ? (
                <Image
                  style={styles.signImg}
                  src={{ data: data.treasSignature.data, format: data.treasSignature.format }}
                />
              ) : null}
              <Text style={styles.signName}>{data.treasName || "Authorised Signatory"}</Text>
              <Text style={styles.signRole}>Treasurer</Text>
            </View>
          </View>
          <Text style={styles.note}>
            This is a computer-generated receipt and does not require a physical signature. Not a tax document.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderReceiptPdf(data: ReceiptData): Promise<Buffer> {
  return renderToBuffer(<ReceiptDoc data={data} />);
}
