import pptxgen from 'pptxgenjs';

export interface SlideData {
  slideNumber: number;
  title: string;
  subtitle?: string;
  layout?: 'title' | 'split' | 'cards' | 'stats' | 'timeline' | 'conclusion';
  bullets?: string[];
  stats?: Array<{ label: string; value: string }>;
  visualNotes?: string;
}

export interface TemplateTheme {
  id: string;
  name: string;
  category: string;
  bgColor: string; // Hex without #
  cardBg: string;
  textColor: string;
  subtextColor: string;
  accentColor: string;
  secondaryColor: string;
  isDark: boolean;
}

export const TEMPLATE_THEMES: Record<string, TemplateTheme> = {
  'concept-cards': {
    id: 'concept-cards',
    name: 'Concept Cards',
    category: 'Technology',
    bgColor: '0E0F1E',
    cardBg: '17172B',
    textColor: 'FFFFFF',
    subtextColor: 'A6A8C0',
    accentColor: '7357FF',
    secondaryColor: '3978FF',
    isDark: true
  },
  'clinic-line': {
    id: 'clinic-line',
    name: 'Clinic Line',
    category: 'Medical',
    bgColor: 'F0FDFA',
    cardBg: 'FFFFFF',
    textColor: '0F172A',
    subtextColor: '0D9488',
    accentColor: '0D9488',
    secondaryColor: '14B8A6',
    isDark: false
  },
  'harbor-print': {
    id: 'harbor-print',
    name: 'Harbor Print',
    category: 'Consulting',
    bgColor: 'F8FAFC',
    cardBg: 'FFFFFF',
    textColor: '0F172A',
    subtextColor: '475569',
    accentColor: '1E3A8A',
    secondaryColor: '38BDF8',
    isDark: false
  },
  'toy-town': {
    id: 'toy-town',
    name: 'Toy Town',
    category: 'Education',
    bgColor: 'FFFBEB',
    cardBg: 'FFFFFF',
    textColor: '451A03',
    subtextColor: 'B45309',
    accentColor: 'F43F5E',
    secondaryColor: 'FBBF24',
    isDark: false
  },
  'first-week': {
    id: 'first-week',
    name: 'First Week',
    category: 'Product',
    bgColor: 'F8FAFC',
    cardBg: 'FFFFFF',
    textColor: '0F172A',
    subtextColor: '64748B',
    accentColor: '84CC16',
    secondaryColor: '0284C7',
    isDark: false
  },
  'team-project': {
    id: 'team-project',
    name: 'Team Project',
    category: 'Business',
    bgColor: 'EEF2FF',
    cardBg: 'FFFFFF',
    textColor: '1E1B4B',
    subtextColor: '4338CA',
    accentColor: '4F46E5',
    secondaryColor: '10B981',
    isDark: false
  },
  'old-atlas': {
    id: 'old-atlas',
    name: 'Old Atlas',
    category: 'Research',
    bgColor: 'FEF3C7',
    cardBg: 'FFFBEB',
    textColor: '451A03',
    subtextColor: '78350F',
    accentColor: 'B45309',
    secondaryColor: '92400E',
    isDark: false
  },
  'page-light': {
    id: 'page-light',
    name: 'Page Light',
    category: 'Minimalist',
    bgColor: 'FFFFFF',
    cardBg: 'FAFAFA',
    textColor: '09090B',
    subtextColor: '71717A',
    accentColor: '18181B',
    secondaryColor: '52525B',
    isDark: false
  },
  'coach-board': {
    id: 'coach-board',
    name: 'Coach Board',
    category: 'Strategy',
    bgColor: '0B132B',
    cardBg: '1C2541',
    textColor: 'F8FAFC',
    subtextColor: '94A3B8',
    accentColor: 'D5FF68',
    secondaryColor: '20B2AA',
    isDark: true
  },
  'neon-sport': {
    id: 'neon-sport',
    name: 'Neon Sport',
    category: 'High Velocity',
    bgColor: '090A0F',
    cardBg: '13141F',
    textColor: 'FFFFFF',
    subtextColor: '9CA3AF',
    accentColor: 'E11D48',
    secondaryColor: '06B6D4',
    isDark: true
  },
  'origami': {
    id: 'origami',
    name: 'Origami',
    category: 'Design',
    bgColor: 'FAF5FF',
    cardBg: 'FFFFFF',
    textColor: '581C87',
    subtextColor: '7E22CE',
    accentColor: 'EC4899',
    secondaryColor: '8B5CF6',
    isDark: false
  },
  'kenshu-green': {
    id: 'kenshu-green',
    name: 'Kenshu Green',
    category: 'Sustainability',
    bgColor: 'F0FDF4',
    cardBg: 'FFFFFF',
    textColor: '14532D',
    subtextColor: '15803D',
    accentColor: '16A34A',
    secondaryColor: '84CC16',
    isDark: false
  }
};

export const exportPresentationToPptx = async (
  title: string,
  slides: SlideData[],
  templateKey: string = 'concept-cards',
  aspectRatio: '16:9' | '4:3' = '16:9'
): Promise<void> => {
  // Initialize PptxGenJS instance
  const pptx = new pptxgen();

  // Set layout
  if (aspectRatio === '4:3') {
    pptx.layout = 'LAYOUT_4x3';
  } else {
    pptx.layout = 'LAYOUT_16x9';
  }

  const theme = TEMPLATE_THEMES[templateKey] || TEMPLATE_THEMES['concept-cards'];

  // Master slide default
  pptx.defineSlideMaster({
    title: 'NEXUS_MASTER',
    background: { color: theme.bgColor }
  });

  slides.forEach((s) => {
    const slide = pptx.addSlide({ masterName: 'NEXUS_MASTER' });

    // Decorative top header bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5,
      y: 0.4,
      w: 0.35,
      h: 0.08,
      fill: { color: theme.accentColor }
    });

    slide.addText(`SLIDE ${s.slideNumber} · ${theme.name.toUpperCase()}`, {
      x: 0.95,
      y: 0.35,
      w: 8.0,
      h: 0.25,
      fontSize: 9,
      bold: true,
      color: theme.subtextColor,
      fontFace: 'Arial'
    });

    // Slide Title
    slide.addText(s.title, {
      x: 0.5,
      y: 0.7,
      w: 9.0,
      h: 0.8,
      fontSize: 24,
      bold: true,
      color: theme.textColor,
      fontFace: 'Arial'
    });

    // Slide Subtitle
    if (s.subtitle) {
      slide.addText(s.subtitle, {
        x: 0.5,
        y: 1.45,
        w: 9.0,
        h: 0.4,
        fontSize: 13,
        italic: true,
        color: theme.subtextColor,
        fontFace: 'Arial'
      });
    }

    const startY = s.subtitle ? 2.0 : 1.7;

    // Layout variations
    if (s.layout === 'stats' && s.stats && s.stats.length > 0) {
      // Metric badges row
      const statCount = s.stats.length;
      const colWidth = Math.min(2.8, (9.0 - (statCount - 1) * 0.3) / statCount);
      s.stats.forEach((st, idx) => {
        const posX = 0.5 + idx * (colWidth + 0.3);
        // Card shape
        slide.addShape(pptx.ShapeType.roundRect, {
          x: posX,
          y: startY,
          w: colWidth,
          h: 1.3,
          fill: { color: theme.cardBg },
          line: { color: theme.accentColor, width: 1 }
        });
        // Big value
        slide.addText(st.value, {
          x: posX,
          y: startY + 0.15,
          w: colWidth,
          h: 0.55,
          fontSize: 22,
          bold: true,
          align: 'center',
          color: theme.accentColor,
          fontFace: 'Arial'
        });
        // Label
        slide.addText(st.label, {
          x: posX,
          y: startY + 0.75,
          w: colWidth,
          h: 0.4,
          fontSize: 10,
          bold: true,
          align: 'center',
          color: theme.subtextColor,
          fontFace: 'Arial'
        });
      });

      // Bullets below stats
      if (s.bullets && s.bullets.length > 0) {
        const bulletItems = s.bullets.map((b) => ({
          text: b,
          options: {
            fontSize: 12,
            color: theme.textColor,
            bullet: { code: '2022' },
            paraSpaceAfter: 8
          }
        }));
        slide.addText(bulletItems, {
          x: 0.5,
          y: startY + 1.55,
          w: 9.0,
          h: 2.5,
          fontFace: 'Arial'
        });
      }
    } else if (s.layout === 'cards' || s.layout === 'split') {
      // 2-column or card container layout
      const leftW = 4.8;
      const rightW = 4.0;

      // Left box: Bullets
      if (s.bullets && s.bullets.length > 0) {
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.5,
          y: startY,
          w: leftW,
          h: 4.2,
          fill: { color: theme.cardBg },
          line: { color: theme.accentColor, width: 0.8 }
        });

        const bulletItems = s.bullets.map((b) => ({
          text: b,
          options: {
            fontSize: 12,
            color: theme.textColor,
            bullet: { code: '2022' },
            paraSpaceAfter: 12
          }
        }));

        slide.addText(bulletItems, {
          x: 0.7,
          y: startY + 0.3,
          w: leftW - 0.4,
          h: 3.6,
          fontFace: 'Arial'
        });
      }

      // Right box: Key Highlights / Stats
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 5.6,
        y: startY,
        w: rightW,
        h: 4.2,
        fill: { color: theme.cardBg },
        line: { color: theme.secondaryColor, width: 0.8 }
      });

      slide.addText('KEY METRICS & ADVISORY', {
        x: 5.8,
        y: startY + 0.3,
        w: rightW - 0.4,
        h: 0.3,
        fontSize: 10,
        bold: true,
        color: theme.accentColor,
        fontFace: 'Arial'
      });

      if (s.stats && s.stats.length > 0) {
        s.stats.slice(0, 3).forEach((st, idx) => {
          const sy = startY + 0.7 + idx * 0.95;
          slide.addText(st.value, {
            x: 5.8,
            y: sy,
            w: rightW - 0.4,
            h: 0.45,
            fontSize: 20,
            bold: true,
            color: theme.secondaryColor,
            fontFace: 'Arial'
          });
          slide.addText(st.label, {
            x: 5.8,
            y: sy + 0.4,
            w: rightW - 0.4,
            h: 0.35,
            fontSize: 10,
            color: theme.subtextColor,
            fontFace: 'Arial'
          });
        });
      } else {
        slide.addText(s.visualNotes || 'Executive presentation layer synthesized by NexusCraft Studio.', {
          x: 5.8,
          y: startY + 0.8,
          w: rightW - 0.4,
          h: 3.0,
          fontSize: 11,
          italic: true,
          color: theme.subtextColor,
          fontFace: 'Arial'
        });
      }
    } else {
      // Standard / Title / Conclusion Layout
      if (s.bullets && s.bullets.length > 0) {
        const bulletItems = s.bullets.map((b) => ({
          text: b,
          options: {
            fontSize: 13,
            color: theme.textColor,
            bullet: { code: '2022' },
            paraSpaceAfter: 14
          }
        }));

        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.5,
          y: startY,
          w: 9.0,
          h: 4.0,
          fill: { color: theme.cardBg },
          line: { color: theme.accentColor, width: 0.8 }
        });

        slide.addText(bulletItems, {
          x: 0.9,
          y: startY + 0.4,
          w: 8.2,
          h: 3.2,
          fontFace: 'Arial'
        });
      }
    }

    // Slide footer
    slide.addText('NexusCraft Studio · AI Generated Presentation (Editable PowerPoint)', {
      x: 0.5,
      y: 6.8,
      w: 8.0,
      h: 0.3,
      fontSize: 8,
      color: theme.subtextColor,
      fontFace: 'Arial'
    });
  });

  const safeTitle = (title || 'Presentation')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40);

  // Write file directly to browser download
  await pptx.writeFile({ fileName: `${safeTitle}.pptx` });
};

