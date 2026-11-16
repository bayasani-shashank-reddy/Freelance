import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const ensureDefaultTemplateDocx = async () => {
  const targetPath = path.join(uploadsDir, 'NexusCraft_Project_Intake_Specification_Template.docx');
  if (fs.existsSync(targetPath)) return targetPath;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'NEXUSCRAFT — PROJECT INTAKE SPECIFICATION TEMPLATE',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            text: 'Official Reference Format for Project Submission & Scoping Dossier',
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Instructions for Client:',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Please fill out this document following the structured sections below. Once complete, upload your finalized version (.docx or .pdf) to the NexusCraft Project Submission Portal.',
                italics: true
              })
            ]
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '1. Executive Summary & Vision',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: '[Describe what your digital product or initiative is, the core business problem it solves, and your primary target audience.]'
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '2. Core Features & Capabilities (Priority Breakdown)',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: '• Priority 1 (Must Have): [List non-negotiable MVP features]'
          }),
          new Paragraph({
            text: '• Priority 2 (Important): [List secondary phase capabilities]'
          }),
          new Paragraph({
            text: '• Priority 3 (Nice to Have): [Future enhancements or stretch goals]'
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '3. Target Platforms & Technological Preferences',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: '[Select / Specify: Web Application (React/Next.js), Mobile App (iOS / Android / Flutter), AI/ML Pipeline, Blockchain/Web3, Backend API / Microservices]'
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '4. Design, Branding & UI/UX Expectations',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: '[Provide benchmark websites, aesthetic style, existing brand color palette or attach brand guideline package.]'
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '5. Budget Tier & Target Delivery Timeline',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: '[Target launch date, milestone schedule requirements, and anticipated budgetary range.]'
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(targetPath, buffer);
  console.log('✅ Generated official default intake specification DOCX template at:', targetPath);
  return targetPath;
};

// If run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ensureDefaultTemplateDocx();
}
