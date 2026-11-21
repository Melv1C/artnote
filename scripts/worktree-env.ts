import { parse } from 'dotenv';

/**
 * A worktree's `.env`, in three layers: `.env.example` (every variable the code expects, with its
 * comments), then the main checkout's `.env` (Melvyn's own values, such as the staging QA
 * accounts), then the worktree's own values (its database and port). A later layer wins.
 */
export function buildWorktreeEnv(
  example: string,
  mainEnv: string | null,
  worktreeValues: Record<string, string>,
) {
  let content = example;
  const added: string[] = [];
  for (const [key, value] of Object.entries(parse(mainEnv ?? ''))) {
    if (hasLine(content, key)) content = setLine(content, key, value);
    else added.push(line(key, value));
  }
  if (added.length > 0) {
    content = `${content.trimEnd()}\n\n# From the main checkout's .env\n${added.join('\n')}\n`;
  }
  for (const [key, value] of Object.entries(worktreeValues)) content = setLine(content, key, value);
  return content;
}

const line = (key: string, value: string) => `${key}="${value}"`;
const linePattern = (key: string) => new RegExp(`^${key}=.*$`, 'm');
const hasLine = (content: string, key: string) => linePattern(key).test(content);

function setLine(content: string, key: string, value: string) {
  return hasLine(content, key)
    ? content.replace(linePattern(key), () => line(key, value))
    : `${content.trimEnd()}\n${line(key, value)}\n`;
}
