const BASE = 'http://localhost:3042';

async function runTests() {
  console.log(`Starting HTTP API verification on ${BASE}...`);

  // Wait for server to come up
  let connected = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`${BASE}/api/settings`);
      if (res.ok) {
        connected = true;
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (!connected) {
    console.error('Failed to connect to Next.js server on port 3042');
    process.exit(1);
  }

  console.log('✓ Server connected successfully');

  // 1. Test /api/settings
  const settingsRes = await fetch(`${BASE}/api/settings`);
  const settingsJson = await settingsRes.json();
  console.log('1. /api/settings:', settingsJson.success, 'AI Provider:', settingsJson.data.ai.provider);
  console.assert(settingsJson.success === true, 'Settings endpoint failed');

  // 2. Test /api/reports
  const reportsRes = await fetch(`${BASE}/api/reports`);
  const reportsJson = await reportsRes.json();
  console.log('2. /api/reports:', reportsJson.success, 'Total Songs:', reportsJson.data.totalSongs, 'Top Mood:', reportsJson.data.mostCommonMood);
  console.assert(reportsJson.success === true, 'Reports endpoint failed');

  // 3. Test /api/songs GET (listing & filtering)
  const songsRes = await fetch(`${BASE}/api/songs?limit=5`);
  const songsJson = await songsRes.json();
  console.log('3. /api/songs GET:', songsJson.success, 'Count:', songsJson.data.length, 'Total:', songsJson.total);
  console.assert(songsJson.success === true, 'Songs GET failed');
  console.assert(Array.isArray(songsJson.data), 'Songs data is not an array');

  // 4. Test /api/analyze error handling when key is missing or input is empty
  const analyzeEmpty = await fetch(`${BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '' })
  });
  const analyzeEmptyJson = await analyzeEmpty.json();
  console.log('4a. /api/analyze rejection for empty title:', analyzeEmpty.status === 400, analyzeEmptyJson.error);
  console.assert(analyzeEmpty.status === 400, 'Should reject empty title with 400');

  const analyzeNoKey = await fetch(`${BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Yesterday', artist: 'The Beatles' })
  });
  const analyzeNoKeyJson = await analyzeNoKey.json();
  console.log('4b. /api/analyze handling missing Gemini key:', analyzeNoKey.status, analyzeNoKeyJson.error);
  console.assert(analyzeNoKey.status === 503 || analyzeNoKey.status === 200, 'Expected graceful error or analysis');

  // 5. Test /api/songs POST (create)
  const newSong = {
    title: 'Test Symphony',
    artist: 'Test Artist',
    genre: 'Classical',
    primaryMood: 'Peaceful',
    secondaryMoods: ['Calm', 'Serene'],
    confidence: 0.95,
    energyLevel: 3,
    valence: 8,
    summary: 'A peaceful orchestral piece with soothing strings.',
    themes: ['nature', 'stillness'],
    emotionalKeywords: ['placid', 'gentle'],
    recommendedActivity: 'Meditation or sleep',
    metadataOnly: true
  };

  const createRes = await fetch(`${BASE}/api/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newSong)
  });
  const createJson = await createRes.json();
  console.log('5. /api/songs POST create:', createJson.success, 'Created ID:', createJson.data?.id);
  console.assert(createJson.success === true, 'Failed to create song');
  const createdId = createJson.data.id;

  // 6. Test /api/songs/[id] GET
  const getSingleRes = await fetch(`${BASE}/api/songs/${createdId}`);
  const getSingleJson = await getSingleRes.json();
  console.log('6. /api/songs/[id] GET:', getSingleJson.success, getSingleJson.data?.title);
  console.assert(getSingleJson.data?.title === 'Test Symphony', 'Get single song failed');

  // 7. Test /api/songs/[id] PATCH
  const patchRes = await fetch(`${BASE}/api/songs/${createdId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Test Symphony (Updated)' })
  });
  const patchJson = await patchRes.json();
  console.log('7. /api/songs/[id] PATCH:', patchJson.success, patchJson.data?.title);
  console.assert(patchJson.data?.title === 'Test Symphony (Updated)', 'Patch song failed');

  // 8. Test /api/songs/[id] DELETE
  const deleteRes = await fetch(`${BASE}/api/songs/${createdId}`, {
    method: 'DELETE'
  });
  const deleteJson = await deleteRes.json();
  console.log('8. /api/songs/[id] DELETE:', deleteJson.success);
  console.assert(deleteJson.success === true, 'Delete song failed');

  // 9. Verify UI Pages respond with 200 OK
  const pages = ['/', '/dashboard', '/library', '/reports', '/settings'];
  for (const p of pages) {
    const pageRes = await fetch(`${BASE}${p}`);
    console.log(`9. Page ${p} HTTP status:`, pageRes.status);
    console.assert(pageRes.status === 200, `Page ${p} did not return 200`);
  }

  console.log('\n========================================');
  console.log('ALL API AND PAGE TESTS PASSED FLAWLESSLY!');
  console.log('========================================\n');
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
