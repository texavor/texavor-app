/* eslint-disable jsx-a11y/alt-text */
"use client";

import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image as PdfImage,
  Link,
} from "@react-pdf/renderer";
import parse, {
  DOMNode,
  Element,
  Text as TextNode,
  domToReact,
  HTMLReactParserOptions,
} from "html-react-parser";

// Register fonts - REMOVED to avoid 404s and complexity.
// Using standard PDF fonts (Helvetica) is safer and faster.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.6,
    color: "#000000",
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 20,
    lineHeight: 1.3,
    color: "#000000",
  },
  h1: {
    fontSize: 20,
    fontWeight: 700,
    marginTop: 15,
    marginBottom: 8,
    color: "#000000",
  },
  h2: {
    fontSize: 16,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 6,
    color: "#000000",
  },
  h3: {
    fontSize: 14,
    fontWeight: 600,
    marginTop: 10,
    marginBottom: 5,
    color: "#000000",
  },
  paragraph: {
    marginBottom: 10,
    textAlign: "justify",
  },
  bold: {
    fontWeight: 700,
  },
  italic: {
    fontStyle: "italic",
  },
  code: {
    fontFamily: "Courier",
    backgroundColor: "#F3F4F6",
    padding: 2,
    fontSize: 10,
  },
  pre: {
    fontFamily: "Courier", // Standard monospace font
    backgroundColor: "#F3F4F6",
    padding: 10,
    marginBottom: 10,
    fontSize: 10,
  },
  image: {
    marginVertical: 10,
    marginHorizontal: "auto",
    maxWidth: "100%",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bullet: {
    width: 15,
    fontSize: 11,
  },
  listItemContent: {
    flex: 1,
  },
  link: {
    color: "#2563EB",
    textDecoration: "underline",
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#E5E7EB",
    paddingLeft: 10,
    marginVertical: 10,
    color: "#4B5563",
    fontStyle: "italic",
  },
});

interface PdfDocumentProps {
  content: string;
  title: string;
  coverUrl?: string | null;
}

const PdfDocument: React.FC<PdfDocumentProps> = ({
  content,
  title,
  coverUrl,
}) => {
  const options: HTMLReactParserOptions = {
    replace: (node) => {
      // Handle text nodes
      if (node.type === "text") {
        const textNode = node as TextNode;
        const text = textNode.data;
        // Clean up whitespace-only text nodes at top level to avoid rendering issues
        // But we need to be careful not to strip spaces between words if they are their own nodes
        // usually html parser groups text.
        if (!text.trim()) return null;
        return <Text>{text}</Text>;
      }

      if (node.type === "tag") {
        const element = node as Element;
        // Recursively convert children with the same options
        const children = domToReact(element.children as DOMNode[], options);

        switch (element.name) {
          case "h1":
            return <Text style={styles.h1}>{children}</Text>;
          case "h2":
            return <Text style={styles.h2}>{children}</Text>;
          case "h3":
            return <Text style={styles.h3}>{children}</Text>;
          case "p":
            return <Text style={styles.paragraph}>{children}</Text>;
          case "div":
            return <View style={{ marginBottom: 5 }}>{children}</View>;
          case "strong":
          case "b":
            return <Text style={styles.bold}>{children}</Text>;
          case "em":
          case "i":
            return <Text style={styles.italic}>{children}</Text>;
          case "u":
            return (
              <Text style={{ textDecoration: "underline" }}>{children}</Text>
            );
          case "code":
            return <Text style={styles.code}>{children}</Text>;
          case "pre":
            return (
              <View style={styles.pre}>
                {/* Pre usually contains code. Ensure children are wrapped in Text if not already */}
                <Text>{children}</Text>
              </View>
            );
          case "img":
            const src = element.attribs.src;
            if (src) {
              return (
                <View style={{ marginBottom: 10 }}>
                  <PdfImage style={styles.image} src={src} />
                </View>
              );
            }
            return null;
          case "ul":
          case "ol":
            return <View style={{ marginBottom: 10 }}>{children}</View>;
          case "li":
            return (
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <View style={styles.listItemContent}>{children}</View>
              </View>
            );
          case "blockquote":
            return (
              <View style={styles.blockquote}>
                <Text>{children}</Text>
              </View>
            );
          case "a":
            const href = element.attribs.href;
            return (
              <Link src={href} style={styles.link}>
                {children}
              </Link>
            );
          case "br":
            return <Text>{"\n"}</Text>;
          default:
            return <React.Fragment>{children}</React.Fragment>;
        }
      }
    },
  };

  const contentComponents = parse(content, options);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cover Image */}
        {coverUrl && (
          <PdfImage
            src={
              coverUrl.startsWith("/") && typeof window !== "undefined"
                ? `${window.location.origin}${coverUrl}`
                : coverUrl
            }
            style={{
              width: "100%",
              height: 200,
              objectFit: "cover",
              borderRadius: 4,
              marginBottom: 20,
            }}
          />
        )}

        {/* Header - Article Title */}
        <Text
          style={{
            position: "absolute",
            top: 20,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 10,
            color: "gray",
          }}
          fixed
        >
          {title}
        </Text>

        {/* contentComponents contains the main content. 
            We might want the main Title to still appear big on the first page?
            User said "top metinoe the title", implying header.
            I will leave the big title in the flow as well? No, usually headers replace it or complement it.
            I'll interpret as "running header".
            Wait, users often want a Title Page.
            I will keep the big title, but maybe user wants it repeated?
            Let's stick to adding a fixed header.
         */}

        {/* Title in flow - Optional, but keeping it makes sense for the start of the doc */}
        <Text style={styles.title}>{title}</Text>

        {/* Content */}
        {contentComponents}

        {/* Footer removed per user request */}
      </Page>
    </Document>
  );
};

export default PdfDocument;
