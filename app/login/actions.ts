'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check Role & Redirect
  const { data: { user } } = await supabase.auth.getUser()
  if(user) {
      // We fetch the profile to check the role
      // Note: We use the prisma client or supabase query here usually, 
      // but for login speed, we just redirect to a protected route 
      // and let Middleware handle the rejection.
  }

  revalidatePath('/', 'layout')
  redirect('/admin/dashboard') // We assume Admin for now
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // This triggers our SQL function
      },
    },
  })

  if (error) {
    // Log full error for server-side debugging
    console.error('🚨 SIGNUP ERROR:', error.message, error.status, error.name)
    console.error('Full error object:', error)
    return { error: error.message }
  }

  // Success
  console.log('✅ SIGNUP SUCCESS:', data)
  revalidatePath('/', 'layout')
  return { message: 'Check your email for the confirmation link!' }
}