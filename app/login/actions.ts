'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  console.log("Login action started")
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  console.log("Attempting login for:", data.email)

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error("Login error:", error)
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  console.log("Login successful, redirecting to /")
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  console.log("Signup action started")
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  console.log("Attempting signup for:", data.email)

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error("Signup error:", error)
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  console.log("Signup successful or confirmation sent")
  revalidatePath('/', 'layout')
  redirect('/login?message=Check email to continue sign in process')
}
