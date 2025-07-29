// Test script to simulate different onboarding scenarios
// Run this in the browser console while on the app

// Test 1: Check current session
async function checkCurrentSession() {
  const { supabase } = await import('@/lib/supabase')
  const { data: { session } } = await supabase.auth.getSession()
  console.log('Current session:', session)
  console.log('User email:', session?.user?.email)
}

// Test 2: Clear session (simulate no auth state)
async function clearSession() {
  const { supabase } = await import('@/lib/supabase')
  await supabase.auth.signOut()
  console.log('Session cleared - refresh page to test empty state')
}

// Test 3: Navigate to onboarding
function goToOnboarding() {
  window.location.href = '/onboarding'
}

console.log('Test functions available:')
console.log('- checkCurrentSession()')
console.log('- clearSession()')
console.log('- goToOnboarding()')