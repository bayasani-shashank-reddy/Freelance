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

export const DEFAULT_TEMPLATE_SECTIONS = [
  {
    title: '1. Executive Summary & Vision',
    placeholder: '[Describe what your digital product or initiative is, the core business problem it solves, and your primary target audience.]'
  },
  {
    title: '2. Core Features & Capabilities (Priority Breakdown)',
    placeholder: '• Priority 1 (Must Have): [List non-negotiable MVP features]\n• Priority 2 (Important): [List secondary phase capabilities]\n• Priority 3 (Nice to Have): [Future enhancements or stretch goals]'
  },
  {
    title: '3. Target Platforms & Technological Preferences',
    placeholder: '[Select / Specify: Web Application (React/Next.js), Mobile App (iOS / Android / Flutter), AI/ML Pipeline, Blockchain/Web3, Backend API / Microservices]'
  },
  {
    title: '4. Design, Branding & UI/UX Expectations',
    placeholder: '[Provide benchmark websites, aesthetic style, existing brand color palette or attach brand guideline package.]'
  },
  {
    title: '5. Budget Tier & Target Delivery Timeline',
    placeholder: '[Target launch date, milestone schedule requirements, and anticipated budgetary range.]'
  }
];

export const generateCustomTemplateDocx = async ({
  title = 'NEXUSCRAFT — PROJECT INTAKE SPECIFICATION TEMPLATE',
  subtitle = 'Official Reference Format for Project Submission & Scoping Dossier',
  instructions = 'Please fill out this document following the structured sections below. Once complete, upload your finalized version (.docx or .pdf) to the NexusCraft Project Submission Portal.',
  sections = DEFAULT_TEMPLATE_SECTIONS
} = {}) => {
  const targetPath = path.join(uploadsDir, 'NexusCraft_Project_Intake_Specification_Template.docx');

  const docChildren = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      text: subtitle,
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
          text: instructions,
          italics: true
        })
      ]
    }),
    new Paragraph({ text: '' })
  ];

  sections.forEach((sec) => {
    docChildren.push(
      new Paragraph({
        text: sec.title,
        heading: HeadingLevel.HEADING_2
      })
    );

    const lines = (sec.placeholder || '').split('\n');
    lines.forEach((l) => {
      docChildren.push(
        new Paragraph({
          text: l
        })
      );
    });

    docChildren.push(new Paragraph({ text: '' }));
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(targetPath, buffer);
  const sizeInKb = (buffer.length / 1024).toFixed(1) + ' KB';
  console.log(`✅ Generated official intake specification DOCX template (${sizeInKb}) at:`, targetPath);
  return { targetPath, sizeInKb };
};

export const ensureDefaultTemplateDocx = async () => {
  const targetPath = path.join(uploadsDir, 'NexusCraft_Project_Intake_Specification_Template.docx');
  if (fs.existsSync(targetPath)) return targetPath;
  await generateCustomTemplateDocx();
  return targetPath;
};
