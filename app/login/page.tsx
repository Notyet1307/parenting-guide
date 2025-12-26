import { login, signup } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string, error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">欢迎回来</CardTitle>
          <CardDescription className="text-center">
            输入邮箱登录或注册账号以同步你的进度
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
              />
            </div>
            
            {params?.message && (
              <div className="p-3 bg-green-100 text-green-700 text-sm rounded-md">
                {params.message}
              </div>
            )}
            
            {params?.error && (
              <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md">
                {params.error}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button formAction={login} className="w-full bg-purple-600 hover:bg-purple-700">
                登 录
              </Button>
              <Button formAction={signup} variant="outline" className="w-full">
                注 册
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
