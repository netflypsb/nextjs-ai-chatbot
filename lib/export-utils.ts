"use client";

/**
 * Client-side export utilities for converting artifact content to downloadable files.
 */

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export markdown content as a .md file
 */
export function exportAsMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  triggerDownload(blob, filename.endsWith(".md") ? filename : `${filename}.md`);
}

/**
 * Export content as a plain text file
 */
export function exportAsText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  triggerDownload(
    blob,
    filename.endsWith(".txt") ? filename : `${filename}.txt`
  );
}

/**
 * Export content as CSV
 */
export function exportAsCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  triggerDownload(
    blob,
    filename.endsWith(".csv") ? filename : `${filename}.csv`
  );
}

/**
 * Export content as HTML file
 */
export function exportAsHtml(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/html;charset=utf-8" });
  triggerDownload(
    blob,
    filename.endsWith(".html") ? filename : `${filename}.html`
  );
}

/**
 * Export HTML content as a PNG image using html-to-image
 */
export async function exportAsPng(htmlContent: string, filename: string) {
  const { toBlob } = await import("html-to-image");

  // Create a temporary container to render the HTML
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.width = "1200px";
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    const blob = await toBlob(container, {
      width: 1200,
      backgroundColor: "#ffffff",
    });
    if (blob) {
      triggerDownload(
        blob,
        filename.endsWith(".png") ? filename : `${filename}.png`
      );
    }
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Export HTML content as PDF using jsPDF + html-to-image
 */
export async function exportAsPdf(htmlContent: string, filename: string) {
  const { toCanvas } = await import("html-to-image");
  const { default: jsPDF } = await import("jspdf");

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.width = "800px";
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    const canvas = await toCanvas(container, {
      width: 800,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Export markdown slides as PPTX using pptxgenjs
 */
export async function exportAsPptx(content: string, filename: string) {
  const PptxGenJS = (await import("pptxgenjs")).default;

  const pptx = new PptxGenJS();
  const slides = content
    .split(/\n---\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const slideContent of slides) {
    const slide = pptx.addSlide();
    const lines = slideContent.split("\n");
    let yPos = 0.5;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      // Skip blockquotes (speaker notes)
      if (trimmed.startsWith(">")) {
        continue;
      }

      if (trimmed.startsWith("# ")) {
        slide.addText(trimmed.slice(2), {
          x: 0.5,
          y: yPos,
          w: 9,
          fontSize: 28,
          bold: true,
          color: "1a1a1a",
        });
        yPos += 0.8;
      } else if (trimmed.startsWith("## ")) {
        slide.addText(trimmed.slice(3), {
          x: 0.5,
          y: yPos,
          w: 9,
          fontSize: 22,
          bold: true,
          color: "333333",
        });
        yPos += 0.7;
      } else if (trimmed.startsWith("- ") || trimmed.match(/^\d+\. /)) {
        const bulletText = trimmed
          .replace(/^[-*]\s*/, "")
          .replace(/^\d+\.\s*/, "");
        slide.addText(bulletText, {
          x: 0.8,
          y: yPos,
          w: 8.5,
          fontSize: 16,
          bullet: true,
          color: "444444",
        });
        yPos += 0.5;
      } else {
        slide.addText(trimmed.replace(/\*\*/g, "").replace(/\*/g, ""), {
          x: 0.5,
          y: yPos,
          w: 9,
          fontSize: 16,
          color: "444444",
        });
        yPos += 0.5;
      }
    }
  }

  const pptxBlob = (await pptx.write({ outputType: "blob" })) as Blob;
  triggerDownload(
    pptxBlob,
    filename.endsWith(".pptx") ? filename : `${filename}.pptx`
  );
}

/**
 * Export content as DOCX using the docx package
 */
export async function exportAsDocx(content: string, filename: string) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import(
    "docx"
  );

  const lines = content.split("\n");
  const paragraphs: InstanceType<typeof Paragraph>[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(4),
          heading: HeadingLevel.HEADING_3,
        })
      );
    } else if (trimmed.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(3),
          heading: HeadingLevel.HEADING_2,
        })
      );
    } else if (trimmed.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(2),
          heading: HeadingLevel.HEADING_1,
        })
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(trimmed.slice(2))],
          bullet: { level: 0 },
        })
      );
    } else if (trimmed.match(/^\d+\. /)) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(trimmed.replace(/^\d+\.\s*/, ""))],
          numbering: { reference: "default-numbering", level: 0 },
        })
      );
    } else if (trimmed === "") {
      paragraphs.push(new Paragraph({}));
    } else {
      // Handle bold and italic
      const runs: InstanceType<typeof TextRun>[] = [];
      const parts = trimmed.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      for (const part of parts) {
        if (part.startsWith("**") && part.endsWith("**")) {
          runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
        } else if (part.startsWith("*") && part.endsWith("*")) {
          runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
        } else {
          runs.push(new TextRun(part));
        }
      }
      paragraphs.push(new Paragraph({ children: runs }));
    }
  }

  const doc = new Document({
    sections: [{ children: paragraphs }],
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: "decimal" as const,
              text: "%1.",
              alignment: "start" as const,
            },
          ],
        },
      ],
    },
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(
    blob,
    filename.endsWith(".docx") ? filename : `${filename}.docx`
  );
}
