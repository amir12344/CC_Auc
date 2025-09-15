/* eslint-disable jsx-a11y/alt-text */
import React from "react";

import {
  Circle,
  Document,
  Image,
  Link,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";

// Types
interface PdfVariant {
  id: string;
  name: string;
  sku?: string;
  units: number;
  retailPrice: number;
  offerPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

interface PdfProduct {
  id: string;
  name: string;
  totalUnits: number;
  retailPrice: number;
  offerPrice: number;
  totalPrice: number;
  imageUrl?: string;
  variants?: PdfVariant[];
}

interface CatalogPdfData {
  catalogName: string;
  catalogImage?: string;
  category: string;
  totalAskingPrice: string;
  leadTime: string;
  description: string;
  unitsInListing: number;
  minOrderValue: number;
  location: string;
  averagePrice: string;
  msrpPercentage?: string;
  packaging?: string;
  shippingWindow?: string;
  products: PdfProduct[];
  listingId: string;
  baseUrl?: string;
  siteTitle?: string;
  headerLogo?: string;
}

// Professional PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 32,
    paddingTop: 56, // leave space for fixed header
    paddingBottom: 48, // leave space for fixed footer
    fontSize: 10,
    fontFamily: "Helvetica",
  },

  // Header section
  header: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "flex-start",
    marginTop: 10,
  },

  headerImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 8,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 10,
    color: "#1a1a1a",
    marginBottom: 4,
    fontWeight: "bold",
  },
  productLink: {
    fontSize: 10,
    color: "#1a1a1a",
    marginBottom: 4,
    marginTop: 4,
  },

  totalOff: {
    fontSize: 10,
    color: "#1a1a1a",
    marginBottom: 3,
    marginTop: 2,
    fontWeight: "bold",
  },

  askingPrice: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 3,
    marginBottom: 3,
  },

  leadTime: {
    fontSize: 10,
    color: "#1a1a1a",
    marginTop: 4,
  },

  // Description section
  descriptionSection: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },

  description: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
  },

  // Metrics section (iconized grid)
  metricsSection: {
    flexDirection: "row",
    marginBottom: 24,
    flexWrap: "wrap",
  },
  metricsItem: {
    width: "33%",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 8,
    marginBottom: 12,
  },
  metricsIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  metricsText: {
    flexDirection: "column",
    flexGrow: 1,
  },
  metricLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e293b",
  },

  // Products table
  tableSection: {
    marginBottom: 24,
  },

  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },

  tableRow: {
    flexDirection: "row",
    minHeight: 40,
    borderBottom: "1px solid #e5e7eb",
  },

  tableHeader: {
    backgroundColor: "#f9fafb",
  },

  tableCol: {
    width: "16.66%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    minHeight: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  tableCell: {
    padding: 6,
    fontSize: 8,
    textAlign: "center",
    lineHeight: 1.2,
    width: "100%",
  },

  tableCellHeader: {
    margin: "auto",
    padding: 8,
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
  },
  productThumb: {
    width: 20,
    height: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  productMetaText: {
    fontSize: 8,
    color: "#374151",
  },
  productMetaStrong: {
    fontSize: 8,
    color: "#111827",
    fontWeight: "bold",
  },

  // Products cards grid (replaces table)
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  productCard: {
    width: "32%",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    padding: 8,
    marginRight: 6,
    marginBottom: 8,
  },
  productImageBox: {
    width: "100%",
    height: 80,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  productTitleText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  productMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  productsCount: {
    fontSize: 10,
    color: "#111827",
    marginBottom: 8,
  },

  // Footer
  // Fixed header bar (appears on every page)
  fixedHeaderBar: {
    position: "absolute",
    top: 16,
    left: 32,
    right: 32,
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  headerDate: {
    position: "absolute",
    left: 0,
    fontSize: 9,
    color: "#111827",
  },
  headerLeft: {
    position: "absolute",
    left: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 10,
    color: "#111827",
    fontWeight: "light",
    textAlign: "center",
  },
  logoImage: {
    width: 80,
    height: 20,
    objectFit: "contain",
    marginRight: 6,
  },
  headerRight: {
    position: "absolute",
    right: 0,
    fontSize: 9,
    color: "#111827",
  },

  // Fixed footer bar (appears on every page)
  fixedFooterBar: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    height: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerUrl: {
    fontSize: 9,
    color: "#2563eb",
    textDecoration: "underline",
  },
  footerPage: {
    fontSize: 9,
    color: "#111827",
  },
});

export const CatalogPdfTemplate: React.FC<{ data: CatalogPdfData }> = ({
  data,
}) => {
  const listingUrl = `${data.baseUrl || "https://www.commercecentral.io"}/marketplace/catalog/${data.listingId}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Fixed header (date/time left, website title center) */}
        <View style={styles.fixedHeaderBar} fixed>
          <View style={styles.headerLeft}>
            {data.headerLogo ? (
              <Image style={styles.logoImage} src={data.headerLogo} />
            ) : null}
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {data.siteTitle ||
                "Buy & Sell Surplus Inventory | Commerce Central Liquidation Platform"}
            </Text>
          </View>
        </View>
        {/* Header with image and basic info */}
        <View style={styles.header}>
          {data.catalogImage && data.catalogImage.length > 0 ? (
            <View
              style={{
                width: 120,
                height: 120,
                marginRight: 20,
                backgroundColor: "#f3f4f6",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <Image style={styles.headerImage} src={data.catalogImage} />
            </View>
          ) : (
            <View
              style={{
                width: 120,
                height: 120,
                marginRight: 20,
                backgroundColor: "#f3f4f6",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 8, color: "#9ca3af" }}>No Image</Text>
            </View>
          )}
          <View style={styles.headerContent}>
            <Text style={styles.title}>{data.catalogName}</Text>
            <Text style={styles.subtitle}>{data.category}</Text>
            <Text style={styles.askingPrice}>
              {/* Combined line: Total asking $X(YY% off on MSRP) */}
              {"Total asking "}
              {data.totalAskingPrice}{" "}
              {data.msrpPercentage ? (
                <Text>({data.msrpPercentage})</Text>
              ) : null}
            </Text>
            <Text style={styles.leadTime}>Lead time: {data.leadTime}</Text>
            <Link
              style={[
                styles.productLink,
                {
                  color: "#2563eb",
                  textDecoration: "underline",
                  marginBottom: 6,
                },
              ]}
              src={listingUrl}
            >
              View Online
            </Link>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{data.description}</Text>
        </View>

        {/* Metrics - Iconized Grid */}
        <View style={styles.metricsSection}>
          {/* Units in Listing - Scroll icon */}
          <View style={styles.metricsItem}>
            <View style={styles.metricsIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  d="M8 6h9a2 2 0 0 1 0 4H7a3 3 0 1 0 0 6h10"
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle
                  cx={6}
                  cy={16}
                  r={1.5}
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1.5}
                />
              </Svg>
            </View>
            <View style={styles.metricsText}>
              <Text style={styles.metricLabel}>Units in Listing</Text>
              <Text style={styles.metricValue}>
                {data.unitsInListing.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Min. Order Value - BadgeCheck icon */}
          <View style={styles.metricsItem}>
            <View style={styles.metricsIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  d="M12 3l2.3 1.2 2.6-.1 1.4 2.2 2.2 1.4-.1 2.6L22 12l-1.6 1.8.1 2.6-2.2 1.4-1.4 2.2-2.6-.1L12 21l-2.3 1.2-2.6-.1-1.4-2.2-2.2-1.4.1-2.6L2 12l1.6-1.8-.1-2.6 2.2-1.4 1.4-2.2 2.6.1L12 3z"
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M8.5 12l2 2 4-4"
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.metricsText}>
              <Text style={styles.metricLabel}>Min. Order Value</Text>
              <Text style={styles.metricValue}>
                ${data.minOrderValue.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Location - MapPin icon */}
          <View style={styles.metricsItem}>
            <View style={styles.metricsIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  d="M20 9c0 5-8 13-8 13S4 14 4 9a8 8 0 1 1 16 0z"
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle
                  cx={12}
                  cy={9}
                  r={2.5}
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1.5}
                />
              </Svg>
            </View>
            <View style={styles.metricsText}>
              <Text style={styles.metricLabel}>Location</Text>
              <Text style={styles.metricValue}>{data.location}</Text>
            </View>
          </View>

          {/* Average Price/Unit - Tag icon */}
          <View style={styles.metricsItem}>
            <View style={styles.metricsIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  d="M20.59 13.41L12 22 2 12l8.59-8.59A2 2 0 0 1 12.96 3H18a2 2 0 0 1 2 2v5.04a2 2 0 0 1-.59 1.37z"
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle cx={15} cy={9} r={1.5} fill="#64748b" />
              </Svg>
            </View>
            <View style={styles.metricsText}>
              <Text style={styles.metricLabel}>Average Price/Unit</Text>
              <Text style={styles.metricValue}>{data.averagePrice}</Text>
            </View>
          </View>

          {/* Packaging - Box icon */}
          <View style={styles.metricsItem}>
            <View style={styles.metricsIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  d="M21 8l-9-5-9 5 9 5 9-5z"
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M3 8v8l9 5 9-5V8"
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M12 13V3"
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.metricsText}>
              <Text style={styles.metricLabel}>Packaging</Text>
              <Text style={styles.metricValue}>{data.packaging || "—"}</Text>
            </View>
          </View>

          {/* Ship Window - Truck icon */}
          <View style={styles.metricsItem}>
            <View style={styles.metricsIcon}>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  d="M3 7h11v7H3z"
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M14 10h4l3 3v1h-7"
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle
                  cx={7.5}
                  cy={17}
                  r={1.5}
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1.5}
                />
                <Circle
                  cx={18.5}
                  cy={17}
                  r={1.5}
                  stroke="#64748b"
                  fill="none"
                  strokeWidth={1.5}
                />
              </Svg>
            </View>
            <View style={styles.metricsText}>
              <Text style={styles.metricLabel}>Ship Window</Text>
              <Text style={styles.metricValue}>
                {data.shippingWindow || data.leadTime || "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Products - Header (divider + count) */}
        <View>
          <Text style={styles.productsCount}>
            {`${data.products.length} product${data.products.length === 1 ? "" : "s"}`}
          </Text>
        </View>

        {/* Products - Cards Grid */}
        <View style={styles.cardsGrid}>
          {data.products.map((product, index) => (
            <View
              key={product.id || String(index)}
              style={styles.productCard}
              wrap={false}
            >
              <View style={styles.productImageBox}>
                {product.imageUrl ? (
                  <Image style={styles.productImage} src={product.imageUrl} />
                ) : (
                  <Text style={{ fontSize: 8, color: "#9ca3af" }}>
                    No Image
                  </Text>
                )}
              </View>
              <Text style={styles.productTitleText}>{product.name}</Text>
              <View style={styles.productMetaRow}>
                <Text style={styles.productMetaText}>
                  {product.totalUnits.toLocaleString()} units
                </Text>
                <Text style={styles.productMetaText}>
                  ${product.offerPrice.toFixed(2)}/unit
                </Text>
              </View>
              <View style={styles.productMetaRow}>
                <Text style={styles.productMetaText}>
                  {product.variants && product.variants.length > 0
                    ? `${product.variants.length} variant${product.variants.length > 1 ? "s" : ""}`
                    : "—"}
                </Text>
                <Text style={styles.productMetaStrong}>
                  $
                  {product.totalPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Fixed footer (product link left, page number right) */}
        <View style={styles.fixedFooterBar} fixed>
          <Link style={styles.footerUrl} src={listingUrl}>
            {listingUrl}
          </Link>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber}/${totalPages}` as any
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export type { CatalogPdfData };
