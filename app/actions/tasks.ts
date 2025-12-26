'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleSystemTask(taskId: string, isCompleted: boolean, week: number, targetUserId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const userId = targetUserId || user.id

  // Check if record exists
  const { data: existing } = await supabase
    .from('user_tasks')
    .select('id')
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .eq('task_type', 'system')
    .single()

  if (existing) {
    // Update
    await supabase.from('user_tasks').update({ is_completed: isCompleted }).eq('id', existing.id)
  } else {
    // Insert
    await supabase.from('user_tasks').insert({
      user_id: userId,
      week,
      task_type: 'system',
      task_id: taskId,
      is_completed: isCompleted
    })
  }

  revalidatePath('/')
}

export async function addCustomTask(content: string, week: number, targetUserId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const userId = targetUserId || user.id

  const { error } = await supabase.from('user_tasks').insert({
    user_id: userId,
    week,
    task_type: 'custom',
    content,
    is_completed: false
  })

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function deleteCustomTask(id: string) {
  const supabase = await createClient()
  // Delete by ID. RLS ensures we can only delete if policy allows.
  // Currently policy restricts to OWNER only (user_id = auth.uid())
  // So you can only delete YOUR own tasks.
  const { error } = await supabase.from('user_tasks').delete().eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function toggleCustomTask(id: string, isCompleted: boolean) {
  const supabase = await createClient()
 
  // RLS allows update if family member
  const { error } = await supabase
    .from('user_tasks')
    .update({ is_completed: isCompleted })
    .eq('id', id)
 
  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function getTasks(week: number, targetUserId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { system: [], custom: [] }

  // If targetUserId is provided, fetch THEIR tasks (RLS must allow it)
  // If not, fetch MY tasks
  const userId = targetUserId || user.id

  const { data, error } = await supabase
    .from('user_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('week', week)

  if (error) {
    console.error('Error fetching tasks:', error)
    return { system: [], custom: [] }
  }

  return {
    system: data.filter(t => t.task_type === 'system'),
    custom: data.filter(t => t.task_type === 'custom')
  }
}
