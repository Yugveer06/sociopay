'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Define styles for the table document
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 15,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 12,
    marginBottom: 15,
    borderRadius: 4,
    color: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 9,
    textAlign: 'center',
    opacity: 0.9,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 8,
    marginBottom: 15,
    border: '1 solid #e2e8f0',
    borderRadius: 4,
  },
  infoText: {
    fontSize: 9,
    color: '#64748b',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    width: '100%',
  },
  tableHeader: {
    backgroundColor: '#2980b9',
    color: 'white',
    fontWeight: 'bold',
  },
  tableCell: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e2e8f0',
    padding: 6,
    fontSize: 9,
    minHeight: 25,
    justifyContent: 'center',
  },
  tableCellNarrow: {
    flex: 1, // Smallest columns
    minWidth: 60,
  },
  tableCellMedium: {
    flex: 2, // Medium columns
    minWidth: 80,
  },
  tableCellWide: {
    flex: 3, // Wide columns
    minWidth: 120,
  },
  tableCellExtraWide: {
    flex: 4, // Extra wide for descriptions
    minWidth: 150,
  },
  tableCellText: {
    textAlign: 'left',
    lineHeight: 1.2,
    wordWrap: 'break-word',
  },
  tableCellTextCenter: {
    textAlign: 'center',
    lineHeight: 1.2,
    wordWrap: 'break-word',
  },
  tableCellTextRight: {
    textAlign: 'right',
    lineHeight: 1.2,
    wordWrap: 'break-word',
  },
  alternateRow: {
    backgroundColor: '#f5f5f5',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
})

export interface TableData {
  [key: string]: string | number | null | undefined
}

interface TableDocumentProps {
  title: string
  subtitle?: string
  data: TableData[]
  columns?: string[]
  companyName?: string
  companySubtitle?: string
}

export const TableDocument = ({
  title,
  subtitle,
  data,
  columns,
  companyName = 'SUKOON',
  companySubtitle = 'C.O.P. HOUSING SOC LTD',
}: TableDocumentProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Use provided columns or extract from first data item
  const tableColumns = columns || (data.length > 0 ? Object.keys(data[0]) : [])

  // Determine column width based on column name and content
  const getColumnStyle = (columnName: string) => {
    const lowerName = columnName.toLowerCase()

    // Narrow columns (flex: 1) - IDs, status, type
    if (
      lowerName.includes('id') ||
      lowerName.includes('no') ||
      lowerName.includes('status') ||
      lowerName.includes('type')
    ) {
      return [styles.tableCell, styles.tableCellNarrow]
    }
    // Medium columns (flex: 2) - dates, amounts, phone, house
    else if (
      lowerName.includes('date') ||
      lowerName.includes('amount') ||
      lowerName.includes('total') ||
      lowerName.includes('phone') ||
      lowerName.includes('house')
    ) {
      return [styles.tableCell, styles.tableCellMedium]
    }
    // Extra wide columns (flex: 4) - descriptions, purpose, category
    else if (
      lowerName.includes('description') ||
      lowerName.includes('purpose') ||
      lowerName.includes('category') ||
      lowerName.includes('details')
    ) {
      return [styles.tableCell, styles.tableCellExtraWide]
    }
    // Wide columns (flex: 3) - names, member info
    else if (
      lowerName.includes('name') ||
      lowerName.includes('member') ||
      lowerName.includes('email')
    ) {
      return [styles.tableCell, styles.tableCellWide]
    }
    // Default to medium sizing
    else {
      return [styles.tableCell, styles.tableCellMedium]
    }
  }

  // Get text alignment based on column content
  const getTextStyle = (
    columnName: string,
    value: string | number | null | undefined
  ) => {
    const lowerName = columnName.toLowerCase()

    // Right align for amounts and numbers
    if (
      lowerName.includes('amount') ||
      lowerName.includes('total') ||
      lowerName.includes('price') ||
      lowerName.includes('cost') ||
      (typeof value === 'number' && value % 1 !== 0)
    ) {
      return styles.tableCellTextRight
    }
    // Center align for status, type, short codes
    else if (
      lowerName.includes('status') ||
      lowerName.includes('type') ||
      lowerName.includes('id') ||
      lowerName.includes('no')
    ) {
      return styles.tableCellTextCenter
    }
    // Left align for everything else
    else {
      return styles.tableCellText
    }
  }

  // Convert data to string values for display
  const formatCellValue = (
    value: string | number | null | undefined
  ): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'number') {
      // Check if it looks like a currency amount
      if (value % 1 !== 0 && value > 0) {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(value)
      }
    }
    return String(value)
  }

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>

        {/* Info Bar */}
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            Generated on: {formatDate(new Date())}
          </Text>
          <Text style={styles.infoText}>Total Records: {data.length}</Text>
          <Text style={styles.infoText}>
            {companyName} - {companySubtitle}
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            {tableColumns.map((column, index) => (
              <View key={index} style={getColumnStyle(column)}>
                <Text style={styles.tableCellText}>
                  {column
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())}
                </Text>
              </View>
            ))}
          </View>

          {/* Table Rows */}
          {data.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[
                styles.tableRow,
                rowIndex % 2 === 1 ? styles.alternateRow : {},
              ]}
            >
              {tableColumns.map((column, colIndex) => (
                <View key={colIndex} style={getColumnStyle(column)}>
                  <Text style={getTextStyle(column, row[column])}>
                    {formatCellValue(row[column])}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This is a computer generated report. Generated on{' '}
            {formatDateTime(new Date())}
          </Text>
          <Text style={styles.footerText}>
            {companyName} - {companySubtitle}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
