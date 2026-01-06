export default function TestEnv() {
  const urlExists = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const keyExists = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const keyValid = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('sb_');
  const keyPrefix = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 25);

  return (
    <div className="p-10 font-mono text-sm bg-black text-green-500 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-white">🔍 Environment Variable Diagnostic</h1>
      <hr className="my-4 border-gray-800" />
      
      <div className="space-y-4">
        <div className="border border-gray-700 p-4 rounded">
          <p className="text-yellow-400">NEXT_PUBLIC_SUPABASE_URL:</p>
          <p className="ml-4">
            {urlExists ? "✅ DETECTED" : "❌ MISSING"}
          </p>
          {process.env.NEXT_PUBLIC_SUPABASE_URL && (
            <p className="ml-4 text-gray-400">{process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          )}
        </div>

        <div className="border border-gray-700 p-4 rounded">
          <p className="text-yellow-400">NEXT_PUBLIC_SUPABASE_ANON_KEY:</p>
          <p className="ml-4">
            {keyExists ? "✅ KEY EXISTS" : "❌ KEY MISSING"}
          </p>
          <p className="ml-4">
            {keyValid ? "✅ VALID FORMAT (starts with sb_)" : "❌ INVALID FORMAT (should start with sb_)"}
          </p>
          {keyExists && (
            <p className="ml-4 text-gray-400">Starts with: {keyPrefix}...</p>
          )}
        </div>

        <div className="border border-gray-700 p-4 rounded">
          <p className="text-yellow-400">Format Check:</p>
          {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('pca_cinemax') ? (
            <p className="ml-4 text-red-500">🚨 ERROR: Key contains 'pca_cinemax' prefix! Remove it from .env.local</p>
          ) : (
            <p className="ml-4 text-green-500">✅ No project name prefix detected</p>
          )}
        </div>

        <div className="border border-yellow-600 p-4 rounded bg-yellow-900 bg-opacity-20 mt-6">
          <p className="text-yellow-300 font-bold">📝 Summary:</p>
          <ul className="ml-4 mt-2 space-y-2">
            <li>URL Status: {urlExists ? "✅" : "❌"}</li>
            <li>Key Status: {keyExists ? "✅" : "❌"}</li>
            <li>Key Format: {keyValid ? "✅" : "❌"}</li>
            <li>All Good: {urlExists && keyExists && keyValid ? "✅ YES - Ready to use!" : "❌ NO - Fix issues above"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
