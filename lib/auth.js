import { supabase } from './supabase'

////export const signUp = async (email, password) => {
////  const { data, error } = await supabase.auth.signUp({
////    email,
////    password,
////  })
////  return { data, error }
////}

////export const signIn = async (email, password) => {
////  const { data, error } = await supabase.auth.signInWithPassword({
////    email,
////    password,
////  })
////  return { data, error }
////}

////export const signOut = async () => {
////  const { error } = await supabase.auth.signOut()
////  return { error }
////}

////export const getCurrentUser = async () => {
////  const { data: { user } } = await supabase.auth.getUser()
////  return user
////}

//export const devBypassAuth = async () => {
//  if (process.env.NODE_ENV === 'development') {
//    const { data: { user }, error } = await supabase.auth.signInWithPassword({
//      email: 'test@example.com',
//      password: 'password123'
//    });
    
//    if (error) {
//      // If test user doesn't exist, create it
//      await supabase.auth.signUp({
//        email: 'test@example.com',
//        password: 'password123'
//      });
//      return await supabase.auth.signInWithPassword({
//        email: 'test@example.com',
//        password: 'password123'
//      });
//    }
//    return { data: { user }, error };
//  }
//};

export const devBypassAuth = async () => {
  if (process.env.NODE_ENV === 'development') {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (error) {
      // If test user doesn't exist, create it
      await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123'
      });
      return await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      });
    }
    return { data: { user }, error };
  }
};