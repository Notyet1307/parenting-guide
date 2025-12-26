'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { UserConfig } from '@/lib/types'

export async function updateProfile(config: UserConfig) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      role: config.role,
      due_date: config.dueDate ? new Date(config.dueDate).toISOString() : null,
      nickname: config.nickname
    })

  if (error) {
    console.error('Error updating profile:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return {
    role: data.role as 'dad' | 'mom',
    dueDate: data.due_date,
    nickname: data.nickname
  } as UserConfig
}
