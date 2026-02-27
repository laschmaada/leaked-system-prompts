import fs from 'fs';
import path from 'path';

export interface PromptData {
  id: string;
  title: string;
  provider: string;
  model: string;
  date: string;
  source: string;
  content: string;
  rawContent: string;
  fileName: string;
}

const REPO_ROOT = path.join(process.cwd(), '..');

export function getAllPrompts(): PromptData[] {
  const files = fs.readdirSync(REPO_ROOT);
  const mdFiles = files.filter(file => file.endsWith('.md') && file !== 'README.md');

  const prompts = mdFiles.map(file => {
    const filePath = path.join(REPO_ROOT, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const fileNameNoExt = file.replace('.md', '');
    const parts = fileNameNoExt.split('_');
    const namePart = parts[0] || '';
    const date = parts[1] || '';

    const nameParts = namePart.split('-');
    const provider = nameParts[0] || 'Unknown';
    const model = nameParts.slice(1).join('-') || namePart;

    const lines = fileContent.split('\n');
    let title = fileNameNoExt;
    let source = '';
    let systemPrompt = '';
    let inSystemPrompt = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('# ') && i === 0) {
        title = line.replace('# ', '').trim();
      } else if (line.startsWith('source:')) {
        source = line.replace('source:', '').trim();
      } else if (line.startsWith('## System Prompt') || line.startsWith('## Prompt')) {
        inSystemPrompt = true;
        continue;
      }

      if (inSystemPrompt) {
        systemPrompt += line + '\n';
      }
    }

    if (!systemPrompt.trim()) {
        const h2Index = fileContent.indexOf('##');
        if (h2Index !== -1) {
            systemPrompt = fileContent.substring(h2Index);
        } else {
            systemPrompt = fileContent;
        }
    }

    return {
      id: fileNameNoExt,
      title,
      provider: provider.charAt(0).toUpperCase() + provider.slice(1),
      model,
      date,
      source,
      content: systemPrompt.trim(),
      rawContent: fileContent,
      fileName: file
    };
  });

  return prompts.sort((a, b) => b.date.localeCompare(a.date));
}
