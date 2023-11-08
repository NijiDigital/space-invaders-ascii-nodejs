declare global {
  type ErrorHandler = (err: unknown) => void
  type ErrorMatcherOptions =
    | {
        error?: Error
        handler?: ErrorHandler
        type?: unknown
        message?: string | RegExp
      }
    | ErrorHandler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  namespace jest {
    interface Matchers<R> {
      toBeRejectedWith: (opt?: ErrorMatcherOptions) => Promise<R>
      toHaveFailedWith: (opt?: ErrorMatcherOptions) => R
    }

    interface Expect {
      toBeRejectedWith: (opt?: ErrorMatcherOptions) => Promise<jest.CustomMatcherResult>
      toHaveFailedWith: (opt?: ErrorMatcherOptions) => jest.CustomMatcherResult
    }
  }
}

export interface ExpectExtensionable extends jest.ExpectExtendMap {
  toBeRejectedWith: (
    promise: Promise<unknown>,
    opt?: ErrorMatcherOptions,
  ) => Promise<jest.CustomMatcherResult>
  toHaveFailedWith: (fn: () => void, opt?: ErrorMatcherOptions) => jest.CustomMatcherResult
}
