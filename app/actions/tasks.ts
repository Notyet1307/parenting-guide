'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleSystemTask(taskId: string, isCompleted: boolean, week: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Check if record exists
  const { data: existing } = await supabase
    .from('user_tasks')
    .select('id')
    .eq('user_id', user.id)
    .eq('task_id', taskId)
    .eq('task_type', 'system')
    .single()

  if (existing) {
    // Update
    await supabase.from('user_tasks').update({ is_completed: isCompleted }).eq('id', existing.id)
  } else {
    // Insert
    await supabase.from('user_tasks').insert({
      user_id: user.id,
      week,
      task_type: 'system',
      task_id: taskId,
      is_completed: isCompleted
    })
  }

  revalidatePath('/')
}

export async function addCustomTask(content: string, week: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('user_tasks').insert({
    user_id: user.id,
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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // We are using ID here, which is the UUID of the row
  const { error } = await supabase.from('user_tasks').delete().eq('id', id).eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function toggleCustomTask(id: string, isCompleted: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('user_tasks')
    .update({ is_completed: isCompleted })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function getTasks(week: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { system: [], custom: [] }

  const { data, error } = await supabase
    .from('user_tasks')
    .select('*')
    .eq('user_id', user.id)
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
