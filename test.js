import test from 'ava';
import fs from 'fs-extra';
import { homedir } from 'os';
import path from 'path';

import gitCommitInfo from './index';

const fixtures = path.join(process.cwd(), 'test', 'fixtures');

const folders = [
  'upToDate',
  'multiline',
];

test.before('rename git folders', () => {
  folders.map(folder => fs.renameSync(path.join(fixtures, folder, 'git'), path.join(fixtures, folder, '.git')));
});

test.after.always('rename .git folders', () => {
  folders.map(folder => fs.renameSync(path.join(fixtures, folder, '.git'), path.join(fixtures, folder, 'git')));
});

test('up to date', (t) => {
  const latestInfo = gitCommitInfo({ cwd: path.join(fixtures, 'multiline')});

  t.is(latestInfo.message, 'do not merge');
  t.is(latestInfo.author, 'JPeer264');
  t.is(latestInfo.email, 'jan.oster94@gmail.com');
  t.is(latestInfo.commit, '19131a4a9465f38a5cab030beb173edd6e23c6de');
  t.is(latestInfo.shortCommit, '19131a4');
});

test('specific commit', (t) => {
  const latestInfo = gitCommitInfo({
    cwd: path.join(fixtures, 'multiline'),
    commit: '66d6043fb740278dac391ad8b41df74ef9e68afc',
  });

  t.is(latestInfo.message, 'Add: index.js\n    \n    Here is more information in the body\n    \n    BREAKING CHANGE: yes, here is a footer');
  t.is(latestInfo.author, 'JPeer264');
  t.is(latestInfo.email, 'jan.oster94@gmail.com');
  t.is(latestInfo.commit, '66d6043fb740278dac391ad8b41df74ef9e68afc');
  t.is(latestInfo.shortCommit, '66d6043');
});

test('unknown commit hash', (t) => {
  const latestInfo = gitCommitInfo({
    cwd: path.join(fixtures, 'multiline'),
    commit: 'does not work',
  });

  t.deepEqual(latestInfo, {});
});

test('no git repo', (t) => {
  const latestInfo = gitCommitInfo({
    cwd: homedir(),
  });

  t.deepEqual(latestInfo, {});
});
