const cache = new Map();
const crypto = require('crypto');

function getHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function formatWithCache(filePath, content) {
  const hash = getHash(content);
  if (cache.has(hash)) return cache.get(hash);
  const formatted = prettier.format(content, { parser: 'babel' });
  cache.set(hash, formatted);
  return formatted;
}

module.exports = { formatWithCache };
