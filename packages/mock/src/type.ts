export type MockData = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string | RegExp
  handler: () => any
}
