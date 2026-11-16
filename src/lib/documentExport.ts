import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export interface ExportableBlueprint {
  title: string;
  category?: string;
  version?: number;
  projectOverview?: string;
  problemStatement?: string;
  proposedSolution?: string;
  essentialFeatures?: string[];
  systemArchitecture?: string;
  techStack?: string[];
  mainModules?: string[];
  developmentPhases?: Array<{ title?: string; duration?: string; deliverables?: string[] }>;
  estimatedTimelineWeeks?: string;
  estimatedDevelopmentEffort?: string;
}

export const exportBlueprintToPdf = (blueprint: ExportableBlueprint) => {
  const doc = new jsPDF();
  let y = 20;

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(34, 36, 56);
  doc.text('NexusCraft Technical Blueprint', 14, y);
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(115, 87, 255);
  doc.text(`Project: ${blueprint.title || 'Digital Platform'} (v${blueprint.version || 1}.0)`, 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 103, 122);
  doc.text(`Category: ${blueprint.category || 'Web Application'} | Generated: ${new Date().toLocaleDateString()}`, 14, y);
  y += 10;

  // Divider line
  doc.setDrawColor(230, 232, 240);
  doc.line(14, y, 196, y);
  y += 10;

  const printSection = (title: string, content: string | string[] | undefined) => {
    if (!content) return;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(34, 36, 56);
    doc.text(title, 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 64, 80);

    if (Array.isArray(content)) {
      content.forEach(item => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(`• ${item}`, 18, y);
        y += 5;
      });
      y += 4;
    } else {
      const splitText = doc.splitTextToSize(content, 180);
      splitText.forEach((line: string) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 14, y);
        y += 5;
      });
      y += 4;
    }
  };

  printSection('1. Executive Architecture Overview', blueprint.projectOverview);
  printSection('2. Problem Statement & Friction', blueprint.problemStatement);
  printSection('3. Proposed Technical Solution', blueprint.proposedSolution);
  printSection('4. Core Architectural Modules', blueprint.mainModules);
  printSection('5. Essential MVP Features', blueprint.essentialFeatures);
  printSection('6. Recommended Technology Stack', blueprint.techStack);
  printSection('7. System Architecture & Patterns', blueprint.systemArchitecture);

  const safeFilename = (blueprint.title || 'blueprint').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  doc.save(`nexuscraft_blueprint_${safeFilename}_v${blueprint.version || 1}.pdf`);
};

export const exportBlueprintToDocx = async (blueprint: ExportableBlueprint) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'NexusCraft Technical Blueprint',
            heading: HeadingLevel.TITLE
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Project: ${blueprint.title || 'Digital Platform'} (v${blueprint.version || 1}.0)`, bold: true }),
              new TextRun({ text: ` | Category: ${blueprint.category || 'Web Application'}` })
            ]
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '1. Executive Architecture Overview', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: blueprint.projectOverview || 'Standard technical baseline.' }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '2. Core Modules', heading: HeadingLevel.HEADING_1 }),
          ...(blueprint.mainModules || []).map(m => new Paragraph({ text: `• ${m}`, bullet: { level: 0 } })),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '3. Essential Features', heading: HeadingLevel.HEADING_1 }),
          ...(blueprint.essentialFeatures || []).map(f => new Paragraph({ text: `• ${f}`, bullet: { level: 0 } })),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '4. System Architecture', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: blueprint.systemArchitecture || 'Cloud-native decoupled architecture.' })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeFilename = (blueprint.title || 'blueprint').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  a.download = `nexuscraft_blueprint_${safeFilename}_v${blueprint.version || 1}.docx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
