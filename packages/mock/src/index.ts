type MockData = Array<{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string | RegExp
  handler: <T>() => T
}>

const mock: MockData = []

export default mock
