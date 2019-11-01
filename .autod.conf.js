'use strict';

module.exports = {
  write: true,
  prefix: '^',
  plugin: 'autod-egg',
  test: ['test', 'benchmark'],
  dep: ['nsqjs'],
  devdep: [
    'egg',
    'egg-ci',
    'egg-bin',
    'autod',
    'autod-egg',
    'eslint',
    'eslint-config-egg',
    'eslint-config-prettier'
  ],
  exclude: ['./test/fixtures', './docs', './coverage']
};
