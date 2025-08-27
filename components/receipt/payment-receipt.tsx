'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Register fonts for better typography (optional)
// You can register custom fonts like this:
// Font.register({
//   family: 'Inter',
//   src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
// })

// Define styles for the receipt
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 20,
    marginBottom: 20,
    borderRadius: 4,
    color: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.9,
  },
  receiptInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 15,
    marginBottom: 20,
    border: '1 solid #e2e8f0',
    borderRadius: 4,
  },
  receiptInfoItem: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: 'normal',
  },
  statusPaid: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  sectionHeader: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  leftColumn: {
    flex: 1,
    paddingRight: 15,
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 15,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 3,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 11,
    color: '#1e293b',
  },
  amountSection: {
    backgroundColor: '#22c55e',
    padding: 15,
    marginVertical: 20,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  amountValue: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  notesSection: {
    marginTop: 20,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#334155',
  },
  notesContent: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 1.4,
    padding: 10,
    backgroundColor: '#f8fafc',
    border: '1 solid #e2e8f0',
    borderRadius: 4,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: '1 solid #e2e8f0',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
    marginBottom: 3,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 15,
  },
})

export interface ReceiptData {
  id: string
  amount: number
  paymentDate: string | null
  userName: string
  houseNumber: string
  category: string
  paymentType: string
  intervalType?: string
  periodStart?: string
  periodEnd?: string
  notes?: string
  createdAt: string
}

interface PaymentReceiptProps {
  data: ReceiptData
  companyName?: string
  companySubtitle?: string
}

export const PaymentReceipt = ({
  data,
  companyName = 'SUKOON - 3 & 4',
  companySubtitle = 'CO.OP. HOUSING SOC LTD',
}: PaymentReceiptProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      currencyDisplay: 'code',
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPaymentType = (type: string) => {
    return type.replace('_', ' ').toUpperCase()
  }

  const formatIntervalType = (type: string) => {
    return type?.replace('_', ' ').toUpperCase() || ''
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{companyName}</Text>
          <Text style={styles.headerTitle}>{companySubtitle}</Text>
          <Text style={[styles.headerSubtitle, { fontSize: 8, marginTop: 3 }]}>
            B/H FATEHWADI BUS STOP, JUHAPURA-SARKHEJ ROAD,
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: 8 }]}>
            VEJALPUR, AHMEDABAD-380051 (GUJARAT)
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: 8 }]}>
            Reg. No. Gh. - 19967 Dt.: 18-06-2001
          </Text>
          <Text style={[styles.headerSubtitle, { marginTop: 8, fontSize: 12 }]}>
            PAYMENT RECEIPT
          </Text>
        </View>

        {/* Receipt Info Section */}
        <View style={styles.receiptInfo}>
          <View style={styles.receiptInfoItem}>
            <Text style={styles.label}>RECEIPT ID</Text>
            <Text style={styles.value}>{data.id}</Text>
          </View>
          <View style={styles.receiptInfoItem}>
            <Text style={styles.label}>ISSUE DATE</Text>
            <Text style={styles.value}>
              {formatDate(new Date().toISOString())}
            </Text>
          </View>
          <View style={styles.receiptInfoItem}>
            <Text style={styles.label}>STATUS</Text>
            <Text style={[styles.value, styles.statusPaid]}>PAID</Text>
          </View>
        </View>

        {/* Payment Details Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PAYMENT DETAILS</Text>
        </View>

        <View style={styles.detailsContainer}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>PAID BY</Text>
              <Text style={styles.detailValue}>{data.userName}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>HOUSE NUMBER</Text>
              <Text style={styles.detailValue}>{data.houseNumber}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>CATEGORY</Text>
              <Text style={styles.detailValue}>{data.category}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>PAYMENT TYPE</Text>
              <Text style={styles.detailValue}>
                {formatPaymentType(data.paymentType)}
              </Text>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>PAYMENT DATE</Text>
              <Text style={styles.detailValue}>
                {formatDate(data.paymentDate)}
              </Text>
            </View>

            {data.intervalType && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>INTERVAL TYPE</Text>
                <Text style={styles.detailValue}>
                  {formatIntervalType(data.intervalType)}
                </Text>
              </View>
            )}

            {data.periodStart && data.periodEnd && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>SERVICE PERIOD</Text>
                <Text style={styles.detailValue}>
                  {formatDate(data.periodStart)} to {formatDate(data.periodEnd)}
                </Text>
              </View>
            )}

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>TRANSACTION DATE</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(data.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Amount Section */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>AMOUNT PAID</Text>
          <Text style={styles.amountValue}>{formatCurrency(data.amount)}</Text>
        </View>

        {/* Notes Section */}
        {data.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>NOTES</Text>
            <Text style={styles.notesContent}>{data.notes}</Text>
          </View>
        )}

        {/* Footer Section */}
        <View style={styles.footer}>
          <View style={styles.divider} />
          <Text style={styles.footerText}>
            This is a computer generated receipt. No signature required.
          </Text>
          <Text style={styles.footerText}>
            Online and cheque are subject to bank clearance.
          </Text>
          <Text style={styles.footerText}>
            Generated on: {formatDateTime(new Date().toISOString())}
          </Text>
          <Text style={styles.footerText}>
            {companyName} - {companySubtitle}
          </Text>
          <Text style={styles.footerText}>
            Developed and Designed by Zaid & Yugveer.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
