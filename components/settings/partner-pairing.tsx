'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Link as LinkIcon, Copy, Loader2, UserMinus } from 'lucide-react'
import { generateInvite, acceptInvite, unlinkPartner, getPartnerStatus } from '@/app/actions/partner'

export function PartnerPairing() {
  const [loading, setLoading] = useState(false)
  const [partner, setPartner] = useState<{ nickname: string, role: string } | null>(null)
  
  // Invite Generation State
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [codeLoading, setCodeLoading] = useState(false)

  // Invite Acceptance State
  const [inputCode, setInputCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const status = await getPartnerStatus()
      if (status) {
        setPartner({ nickname: status.nickname, role: status.role })
      } else {
        setPartner(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleGenerate = async () => {
    setCodeLoading(true)
    setError(null)
    const res = await generateInvite()
    if (res.error) {
      setError(res.error)
    } else if (res.code) {
      setInviteCode(res.code)
    }
    setCodeLoading(false)
  }

  const handleJoin = async () => {
    if (!inputCode || inputCode.length !== 6) return
    setJoinLoading(true)
    setError(null)
    const res = await acceptInvite(inputCode)
    if (res.error) {
      setError(typeof res.error === 'string' ? res.error : 'Failed to join')
    } else {
      await checkStatus() // Refresh
      setInviteCode(null)
    }
    setJoinLoading(false)
  }

  const handleUnlink = async () => {
    if (!confirm('确定要解除绑定吗？')) return
    setLoading(true)
    await unlinkPartner()
    setPartner(null)
    setLoading(false)
  }

  if (partner) {
    return (
      <Card className="border-pink-200 bg-pink-50/50">
         <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
            家庭绑定
          </CardTitle>
          <CardDescription>
            已与 <span className="font-bold text-pink-600">{partner.nickname}</span> ({partner.role === 'dad' ? '准爸爸' : '准妈妈'}) 绑定
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Button variant="outline" size="sm" onClick={handleUnlink} className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
             <UserMinus className="w-4 h-4 mr-2" />
             解除绑定
           </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-slate-400" />
          邀请伴侣
        </CardTitle>
        <CardDescription>
          绑定后可互相查看任务进度，共同管理孕期生活。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Option 1: Generate Code */}
        <div className="space-y-2">
           <Label>我的邀请码</Label>
           <div className="flex gap-2">
             {inviteCode ? (
               <div className="flex-1 bg-slate-100 p-2 rounded text-center font-mono text-lg tracking-widest font-bold text-slate-700 border border-slate-200">
                 {inviteCode}
               </div>
             ) : (
               <Button variant="outline" className="flex-1" onClick={handleGenerate} disabled={codeLoading}>
                 {codeLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                 生成邀请码
               </Button>
             )}
             {inviteCode && (
               <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(inviteCode)}>
                 <Copy className="w-4 h-4" />
               </Button>
             )}
           </div>
           {inviteCode && <p className="text-xs text-slate-500">有效期 1 小时，请让伴侣输入此码。</p>}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">或者</span>
          </div>
        </div>

        {/* Option 2: Enter Code */}
        <div className="space-y-2">
          <Label>输入伴侣的邀请码</Label>
          <div className="flex gap-2">
            <Input 
              placeholder="6位验证码" 
              maxLength={6} 
              className="uppercase font-mono"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            />
            <Button onClick={handleJoin} disabled={joinLoading || inputCode.length !== 6}>
              {joinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '绑定'}
            </Button>
          </div>
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
