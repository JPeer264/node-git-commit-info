import execa from 'execa';
import isGit from 'is-git-repository';
import { platform } from 'os';
import path from 'path';
import pathIsAbsolute from 'path-is-absolute';

const processCwd = process.cwd();
const regex = /\s+([\s\S]*)/g; // matches everything after the first whitespace

const gitCommitInfo = ({ cwd, commit } = {}) => {
  const thisCommit = commit || '';

  let thisPath = cwd || processCwd;

  thisPath = pathIsAbsolute(thisPath) ? thisPath : path.join(cwd, thisPath);

  if (!isGit(thisPath)) {
    return {};
  }

  try {
    let exec;

    if (platform() === 'win32') {
      exec = execa.shellSync(`pushd ${thisPath} & git --no-pager show ${thisCommit} --summary`);
    } else {
      exec = execa.shellSync(`(cd ${thisPath} ; git --no-pager show ${thisCommit} --summary)`);
    }

    const info = exec.stdout
      .split('\n')
      .filter(entry => entry.length !== 0);

    const hash = new RegExp(regex).exec(info[0])[1];
    const shortHash = hash.slice(0, 7);
    const author = new RegExp(regex).exec(info[1])[1].match(/([^<]+)/)[1].trim();
    const email = new RegExp(regex).exec(info[1])[1].match(/<([^>]+)>/)[1];
    const date = new RegExp(regex).exec(info[2])[1];
    const message = exec.stdout.split('\n\n')[1].trim();

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
  } catch (e) {
    console.info(e);
    return {};
  }
};

export default gitCommitInfo;
