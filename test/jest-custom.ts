import type { ExpectExtensionable } from './types/jest-custom'

const expectExtension: ExpectExtensionable = {
  async toBeRejectedWith(promise: Promise<unknown>, opt?) {
    try {
      await promise
    } catch (error) {
      handleError(error, opt)
      return {
        message: () => 'promise is rejected with expected error',
        pass: true,
      }
    }
    return { message: () => 'promise is not rejected', pass: false }
  },
  toHaveFailedWith(fn: () => void, opt?) {
    try {
      fn()
    } catch (error) {
      handleError(error, opt)
      return { message: () => 'function thrown expected error', pass: true }
    }
    return { message: () => 'function did not throw any error', pass: false }
  },
}

const handleError = (err: unknown, opt?: ErrorMatcherOptions): void => {
  if (typeof opt === 'function') {
    opt(err)
    return
  }
  if (opt?.error) {
    expect(err).toBe(opt.error)
    return
  }
  if (opt?.type) {
    expect(err).toBeInstanceOf(opt.type)
  }
  if (opt?.message) {
    if (typeof opt.message === 'string') {
      expect(err).toHaveProperty('message', opt.message)
    } else {
      expect(err).toMatchObject({
        message: expect.stringMatching(opt.message) as string,
      })
    }
  }
  if (opt?.handler) {
    opt.handler(err)
  }
}

expect.extend(expectExtension)
