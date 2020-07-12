import execa from 'execa';
import isGit from 'is-git-repository';
import path from 'path';
import isAbsolute from 'is-absolute';

export interface GitCommitInfoOptions {
  cwd?: string;
  commit?: string;
}

const processCwd = process.cwd();
const regex = /\s+([\s\S]*)/g; // matches everything after the first whitespace

const gitCommitInfo = ({ cwd, commit }: GitCommitInfoOptions = {}) => {
  const thisCommit = commit || '';

  let thisPath = cwd || processCwd;

  thisPath = isAbsolute(thisPath) ? thisPath : path.join(cwd, thisPath);

  if (!isGit(thisPath)) {
    return {};
  }

  try {
    const { stdout } = execa.commandSync(`git --no-pager show ${thisCommit} --summary`, { cwd });

    const info = stdout
      .split('\n')
      .filter((entry) => entry.length !== 0);
    const mergeIndex = info[1].indexOf('Merge') === -1 ? 0 : 1;

    const hash = (new RegExp(regex).exec(info[0]) || [])[1];
    const shortHash = hash.slice(0, 7);
    const author = new RegExp(regex).exec(info[1 + mergeIndex])[1].match(/([^<]+)/)[1].trim();
    const email = new RegExp(regex).exec(info[1 + mergeIndex])[1].match(/<([^>]+)>/)[1];
    const date = new RegExp(regex).exec(info[2 + mergeIndex])[1];
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
