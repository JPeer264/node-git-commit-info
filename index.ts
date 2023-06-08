import execa from 'execa';
import isGit from 'is-git-repository';
import path from 'path';

export interface GitCommitInfoOptions {
  cwd?: string;
  commit?: string;
}

export interface GitCommitInfoResult {
  hash?: string;
  shortHash?: string;
  commit?: string;
  shortCommit?: string;
  author?: string;
  email?: string;
  date?: string;
  message?: string;
  error?: Error,
}

const regex = /\s+([\s\S]*)/g; // matches everything after the first whitespace
const hashRegex = /^[0-9a-f]{7,40}$/;

const gitCommitInfo = (options: GitCommitInfoOptions = {}): GitCommitInfoResult => {
  const {
    cwd = process.cwd(),
    commit,
  } = options;
  const thisCommit = commit || '';
  const thisPath = path.resolve(cwd);

  if ((thisCommit && !(new RegExp(hashRegex).test(thisCommit)))) {
    return { error: new Error('Not a valid commit hash') };
  }

  if (!isGit(thisPath)) {
    return {};
  }

  try {
    const { stdout } = execa.commandSync(`git --no-pager show ${thisCommit} --summary`, { cwd });

    const info = stdout
      .split('\n')
      .filter((entry) => entry.length !== 0);
    const mergeIndex = info[1]?.indexOf('Merge') === -1 ? 0 : 1;

    const hash = (new RegExp(regex).exec(info[0]) || [])[1];
    const shortHash = hash.slice(0, 7);

    const getInfo = (index: number): string | undefined => {
      const [, extractedInfo] = (new RegExp(regex).exec(info[index]) || []);

      return extractedInfo;
    };

    const author = (getInfo(1 + mergeIndex)?.match(/([^<]+)/) || [])[1]?.trim();
    const [, email] = getInfo(1 + mergeIndex)?.match(/<([^>]+)>/) || [];
    const date = getInfo(2 + mergeIndex);
    const message = stdout.split('\n\n')[1].trim();

    return {
      hash,
      shortHash,
      commit: hash,
      shortCommit: shortHash,
      author,
      email,
      date,
      message,
    };
  } catch (error) {
    return { error };
  }
};

export default gitCommitInfo;
