'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Generate a 6-digit invite code for the current user
 */
export async function generateInvite() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // 1. Generate random 6 char code
  const characters = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  // 2. Insert into partner_invites
  const { error } = await supabase
    .from('partner_invites')
    .insert({
      code: code,
      created_by: user.id
    })

  if (error) {
    console.error('Error creating invite:', error)
    return { error: 'Failed to generate code' }
  }

  return { code }
}

/**
 * Accept an invite code to link with another user
 */
export async function acceptInvite(code: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('match_partner', { 
    invite_code: code 
  })

  if (error) {
    console.error('RPC Error:', error)
    return { error: error.message }
  }

  // RPC returns JSONB, check if it explicitly returned an error object
  if (data && data.error) {
    return { error: data.error }
  }

  revalidatePath('/')
  return { success: true }
}

/**
 * Unlink current partner
 */
export async function unlinkPartner() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('unlink_partner')

  if (error) {
    console.error('RPC Error:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

/**
 * Get current partner status
 */
export async function getPartnerStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get my profile to find partner_id
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('id', user.id)
    .single()

  if (!myProfile?.partner_id) return null

  // Get partner profile (RLS allows this now)
  const { data: partnerProfile } = await supabase
    .from('profiles')
    .select('nickname, role')
    .eq('id', myProfile.partner_id)
    .single()

  return {
    partnerId: myProfile.partner_id,
    nickname: partnerProfile?.nickname || '伴侣',
    role: partnerProfile?.role
  }
}
