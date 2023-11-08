declare global {
  type ErrorHandler = (err: unknown) => void
  type ErrorMatcherOptions =
    | ErrorHandler
    | {
        error?: Error
        handler?: ErrorHandler
        message?: RegExp | string
        type?: unknown
      }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  namespace jest {
    interface Matchers<R> {
      toBeRejectedWith: (opt?: ErrorMatcherOptions) => Promise<R>
      toHaveFailedWith: (opt?: ErrorMatcherOptions) => R
    }

    interface Expect {
      toBeRejectedWith: (
        opt?: ErrorMatcherOptions,
      ) => Promise<CustomMatcherResult>
      toHaveFailedWith: (opt?: ErrorMatcherOptions) => CustomMatcherResult
    }
  }
}

export interface ExpectExtensionable extends jest.ExpectExtendMap {
  toBeRejectedWith: (
    promise: Promise<unknown>,
    opt?: ErrorMatcherOptions,
  ) => Promise<jest.CustomMatcherResult>
  toHaveFailedWith: (
    fn: () => void,
    opt?: ErrorMatcherOptions,
  ) => jest.CustomMatcherResult
}
