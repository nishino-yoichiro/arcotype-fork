export default async function handler(req, res) {
  const { typefaceId } = req.query;
  if (!typefaceId) {
    return res.status(400).json({ error: 'Missing typefaceId' });
  }
  try {
    const apiRes = await fetch(`https://fontsinuse.com/api/uses?typeface=${typefaceId}`);
    const data = await apiRes.json();
    console.log('FontsInUse API response:', data);
    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: 'Failed to fetch from Fonts In Use', data });
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
} 