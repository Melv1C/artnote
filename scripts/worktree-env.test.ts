import { describe, expect, it } from 'vite-plus/test';
import { buildWorktreeEnv } from './worktree-env';

const EXAMPLE = `# Public base URL
BASE_URL="http://localhost:3000"

# Object storage
S3_BUCKET="artnote"
`;

describe('buildWorktreeEnv', () => {
  it("takes the main checkout's values over the example and keeps the variables only it has", () => {
    const main = 'S3_BUCKET="main-bucket"\nQA_ADMIN_PASSWORD="from-main"\n';
    expect(buildWorktreeEnv(EXAMPLE, main, {})).toBe(`# Public base URL
BASE_URL="http://localhost:3000"

# Object storage
S3_BUCKET="main-bucket"

# From the main checkout's .env
QA_ADMIN_PASSWORD="from-main"
`);
  });

  it("gives the worktree its own base URL over the main checkout's", () => {
    const main = 'BASE_URL="http://localhost:3999"\n';
    expect(buildWorktreeEnv(EXAMPLE, main, { BASE_URL: 'http://localhost:3142' }))
      .toBe(`# Public base URL
BASE_URL="http://localhost:3142"

# Object storage
S3_BUCKET="artnote"
`);
  });

  it('starts from the example alone when the main checkout has no .env', () => {
    expect(buildWorktreeEnv(EXAMPLE, null, { BASE_URL: 'http://localhost:3142' }))
      .toBe(`# Public base URL
BASE_URL="http://localhost:3142"

# Object storage
S3_BUCKET="artnote"
`);
  });
});
