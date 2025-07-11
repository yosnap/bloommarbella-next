export async function GET() {
  return Response.json({ message: 'pong', timestamp: new Date().toISOString() })
}