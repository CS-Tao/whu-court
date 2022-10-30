import sleep from './sleep'

const defaultOptions = {
  limit: 3,
  wait: 0,
}

// eslint-disable-next-line space-before-function-paren
function retryIf<T, K = (...args: unknown[]) => Promise<T>>(
  func: K,
  condition: (res?: T, error?: Error) => boolean,
  options = defaultOptions,
): K {
  if (!['[object AsyncFunction]', '[object Function]'].includes(Object.prototype.toString.call(func))) {
    throw Error('func param error in retryIf')
  }
  if (options.limit < 1) throw Error('limit param error in retryIf')
  return (async (...args: unknown[]) => {
    let retry = 0
    let res: T | undefined
    let error: Error | undefined
    while (retry === 0 || (retry <= options.limit && condition(res, error))) {
      try {
        if (retry > 0 && options.wait) await sleep(options.wait)
        res = await (func as (...args: unknown[]) => Promise<T>)(...args)
        error = undefined
      } catch (err) {
        error = err as Error
      }
      retry++
    }
    if (error) throw error
    return res as T
  }) as K
}

export default retryIf
