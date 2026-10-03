import { SERVER_ORIGIN } from '../config/env';

const PALETTE = ['#2D3282', '#12B8A6', '#F2A93B', '#E5484D', '#6D5ACF', '#0EA5A0', '#D9770A', '#3B41A8'];

function colorFor(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initialsFor(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getFullImageUrl(src) {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:')) {
    return src;
  }
  if (src.startsWith('/')) {
    return `${SERVER_ORIGIN}${src}`;
  }
  return `${SERVER_ORIGIN}/uploads/${src}`;
}

export default function Avatar({ name, src, size = 'md' }) {
  const cls = size === 'lg' ? 'avatar avatar-lg' : 'avatar';
  const imgUrl = getFullImageUrl(src);

  if (imgUrl) {
    return (
      <div className={cls} style={{ overflow: 'hidden', background: 'var(--border)' }}>
        <img
          src={imgUrl}
          alt={name || 'Avatar'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
    );
  }

  return (
    <div className={cls} style={{ background: colorFor(name) }}>
      {initialsFor(name)}
    </div>
  );
}