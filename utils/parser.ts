import { FoundryItem, FoundrySystemData } from '../types';

/**
 * Generates a pseudo-random ID compatible with Foundry's ID format (16 chars alphanumeric)
 */
const generateId = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Creates a generic Foundry Item object (Talent or Spell)
 */
const createFoundryItem = (name: string, type: 'talent' | 'spell', systemData: FoundrySystemData): FoundryItem => {
  // Default Image
  const img = type === 'spell' ? "icons/svg/item-bag.svg" : "icons/svg/mystery-man.svg";

  return {
    folder: null, // Let user organize in Foundry
    name: name,
    type: type,
    img: img,
    system: systemData,
    effects: [],
    flags: {},
    _stats: {
      compendiumSource: null,
      duplicateSource: null,
      exportSource: {
        worldId: "forbidden-lands",
        uuid: `Item.${generateId()}`,
        coreVersion: "13.350",
        systemId: "forbidden-lands",
        systemVersion: "13.0.5"
      },
      coreVersion: "13.350",
      systemId: "forbidden-lands",
      systemVersion: "13.0.5",
      createdTime: Date.now(),
      modifiedTime: Date.now(),
      lastModifiedBy: generateId()
    },
    ownership: {
      default: 0
    }
  };
};

/**
 * =========================================
 * TALENT PARSING LOGIC
 * =========================================
 */
const parseTalentHTMLNode = (h3: Element): FoundryItem => {
    // 1. Extract Name
    const name = h3.textContent?.trim() || "Talento Sem Nome";

    // 2. Build Description
    let descriptionHtml = "";
    
    // Process siblings until the end of the container or another header
    let current: Element | null = h3.nextElementSibling;
    
    while (current) {
      if (current.tagName === 'H3') break; // Stop if we hit the next item

      if (current.tagName === 'P') {
        const text = current.textContent?.trim() || "";
        if (text.toUpperCase().includes('COMENTÁRIO')) {
            const commentContent = text.replace(/^COMENT(Á|&Aacute;)RIO:?/i, '').trim();
            descriptionHtml += `<p><strong>COMENTÁRIO:</strong> ${commentContent}</p>`;
        } else {
            if (text) descriptionHtml += `<p>${text}</p>`;
        }
      } 
      else if (current.tagName === 'UL') {
        // For Talents, the list IS the description of ranks
        let listHtml = "<ul>";
        const lis = current.querySelectorAll('li');
        lis.forEach((li) => {
          const liClone = li.cloneNode(true) as HTMLElement;
          const spans = liClone.querySelectorAll('span');
          spans.forEach(s => s.remove());
          let cleanInner = liClone.innerHTML;
          cleanInner = cleanInner.replace(/ style="[^"]*"/gi, '');
          listHtml += `<li>${cleanInner.trim()}</li>`;
        });
        listHtml += "</ul>";
        descriptionHtml += listHtml;
      }
      current = current.nextElementSibling;
    }

    return createFoundryItem(name, 'talent', {
        rollModifiers: {},
        category: "general",
        rank: "1",
        description: descriptionHtml,
        type: "profession"
    });
};

/**
 * =========================================
 * SPELL PARSING LOGIC
 * =========================================
 */
const parseSpellHTMLNode = (h3: Element): FoundryItem => {
    // 1. Extract Name
    const name = h3.textContent?.trim() || "Magia Sem Nome";

    // 2. Defaults
    let rank = "1";
    let range = "Ao Alcance Das Mãos";
    let duration = "Imediato";
    let ingredient = "";
    let descriptionHtml = "";

    // 3. Process Siblings
    let current: Element | null = h3.nextElementSibling;
    
    while (current) {
        if (current.tagName === 'H3') break;

        if (current.tagName === 'UL') {
            // For Spells, UL contains Metadata (Rank, Range, etc.)
            const lis = current.querySelectorAll('li');
            lis.forEach(li => {
                const text = li.textContent || "";
                const cleanText = text.replace('✥', '').trim(); // Remove raw symbol just in case
                
                // Helper to extract value after colon
                const getValue = (key: string) => {
                    const parts = cleanText.split(':');
                    if (parts.length > 1) return parts[1].trim();
                    return "";
                };

                if (cleanText.toUpperCase().includes('CATEGORIA')) rank = getValue('CATEGORIA') || "1";
                else if (cleanText.toUpperCase().includes('ALCANCE')) range = getValue('ALCANCE');
                else if (cleanText.toUpperCase().includes('DURAÇÃO')) duration = getValue('DURAÇÃO');
                else if (cleanText.toUpperCase().includes('INGREDIENTE')) ingredient = getValue('INGREDIENTE');
            });
            // We DO NOT add this UL to descriptionHtml
        } 
        else if (current.tagName === 'P') {
            const text = current.textContent?.trim() || "";
            // Clean paragraph styles but keep content
            if (text) {
                // Simple tag strip for styles, keeping structure
                descriptionHtml += `<p>${current.innerHTML.replace(/ style="[^"]*"/gi, '')}</p>`;
            }
        }

        current = current.nextElementSibling;
    }

    return createFoundryItem(name, 'spell', {
        spellType: "SPELL.SPELL",
        rank,
        range,
        duration,
        ingredient,
        description: descriptionHtml
    });
};


/**
 * Generic Parser Wrapper
 */
const parseHTMLInput = (input: string, mode: 'talent' | 'spell'): FoundryItem[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'text/html');
    const items: FoundryItem[] = [];

    const titles = doc.querySelectorAll('h3');
    
    titles.forEach((h3) => {
        if (mode === 'talent') {
            items.push(parseTalentHTMLNode(h3));
        } else {
            items.push(parseSpellHTMLNode(h3));
        }
    });

    return items;
};

// Legacy Text Parser (Only for Talents really, but keeping it safe)
const formatPlainTextDescription = (rawText: string): string => {
    // ... (Legacy logic kept simple) ...
    return `<p>${rawText}</p>`; 
};

/**
 * Public API
 */
export const parseTalents = (input: string): FoundryItem[] => {
    const trimmed = input.trim();
    if (trimmed.startsWith('<') || trimmed.includes('<h3')) {
        return parseHTMLInput(trimmed, 'talent');
    }
    // Fallback text parser (simplified for brevity as focus is HTML now)
    const blocks = input.split(/\n\s*\n\s*\n/).filter(b => b.trim().length > 0);
    return blocks.map(block => {
        const lines = block.trim().split('\n');
        return createFoundryItem(lines[0].trim(), 'talent', {
            description: formatPlainTextDescription(lines.slice(1).join('\n')),
            rank: "1",
            category: "general",
            type: "profession",
            rollModifiers: {}
        });
    });
};

export const parseSpells = (input: string): FoundryItem[] => {
    const trimmed = input.trim();
    // Spells are strictly HTML based on prompt requirements
    if (trimmed.startsWith('<') || trimmed.includes('<h3')) {
        return parseHTMLInput(trimmed, 'spell');
    }
    return [];
};