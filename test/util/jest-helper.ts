import { join } from 'node:path'

import { baseDir } from '../../src/util/base-dir'

const doMockFromBaseDir: <T = unknown>(
  moduleNameFromBaseDir: string,
  factory?: () => T,
  options?: jest.MockOptions,
) => typeof jest = (moduleNameFromBaseDir, factory, options) => {
  const moduleName = join(baseDir, moduleNameFromBaseDir)
  return jest.doMock(moduleName, factory, options)
}

const fromBaseDir: (moduleNameFromBaseDir: string) => string = (
  moduleNameFromBaseDir,
) => join(baseDir, moduleNameFromBaseDir)

const requireFromBaseDir = <TModule = unknown>(
  moduleNameFromBaseDir: string,
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return
): TModule => require(fromBaseDir(moduleNameFromBaseDir))

export { doMockFromBaseDir, fromBaseDir, requireFromBaseDir }
