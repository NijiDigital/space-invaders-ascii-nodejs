import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Config as JestConfig } from 'jest'

import { baseDir } from '../src/util/base-dir'
import { buildReporters, ci } from './jest-config-helper'

const { name } = JSON.parse(
  readFileSync(join(baseDir, 'package.json'), 'utf8'),
) as { name: string }

const jestConfig: JestConfig = {
  ci,
  clearMocks: true,
  collectCoverageFrom: ['src/**/!(*.d)*.ts'],
  coverageDirectory: join(baseDir, 'dist', 'coverage', 'all'),
  coverageReporters: ['text', 'json', 'cobertura', 'lcov', 'html'],
  displayName: name,
  globalSetup: join(baseDir, 'test', 'jest-global-setup.ts'),
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/lib/',
    '<rootDir>/tmp/',
  ],
  preset: 'ts-jest',
  reporters: buildReporters(),
  rootDir: baseDir,
  setupFilesAfterEnv: [join(baseDir, 'test', 'jest-custom.ts')],
  silent: true,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.[jt]s'],
  verbose: false,
}

// noinspection JSUnusedGlobalSymbols
export default jestConfig
