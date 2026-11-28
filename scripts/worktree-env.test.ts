import { describe, expect, it } from 'vite-plus/test';
import {
  buildWorktreeEnv,
  databaseName,
  e2eDatabaseName,
  isE2eDatabaseName,
  worktreeDatabaseName,
} from './worktree-env';

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

describe('database names', () => {
  it("keeps a worktree's database and its end-to-end one within Postgres' 63 characters", () => {
    const slug = 'a'.repeat(70);
    expect(worktreeDatabaseName(slug)).toBe(`artnote_${'a'.repeat(55)}`);
    expect(e2eDatabaseName(worktreeDatabaseName(slug))).toBe(`artnote_${'a'.repeat(51)}_e2e`);
    expect(e2eDatabaseName('artnote_feat_x')).toBe('artnote_feat_x_e2e');
  });

  it('treats only an end-to-end database as throwaway', () => {
    expect(isE2eDatabaseName('artnote_feat_x_e2e')).toBe(true);
    expect(isE2eDatabaseName('artnote_feat_x')).toBe(false);
    expect(isE2eDatabaseName('_e2e')).toBe(false);
  });

  it('reads the database from a URL and refuses a name unsafe to quote into SQL', () => {
    expect(databaseName('postgresql://u:p@localhost:5432/artnote_x')).toBe('artnote_x');
    expect(() => databaseName('postgresql://u:p@localhost:5432/Artnote')).toThrow(/lowercase/);
    expect(() => databaseName('postgresql://u:p@localhost:5432/a%22b')).toThrow(/lowercase/);
  });
});
