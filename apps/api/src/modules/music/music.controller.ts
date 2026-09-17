import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client.js';
import { authenticate, requireRoles, AuthenticatedRequest } from '../../common/middleware/auth.middleware.js';

const router = Router();

// Whitelist of allowed embed domains for security
const ALLOWED_EMBED_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'spotify.com',
  'open.spotify.com',
];

function isSafeEmbedUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return ALLOWED_EMBED_DOMAINS.some((domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

const trackSchema = z.object({
  playlistId: z.string().optional(),
  title: z.string().min(2).max(120),
  artist: z.string().min(2).max(120),
  category: z.enum(['AGOMONI', 'MAHALAYA', 'DHAK', 'PUJA_SONGS', 'AMBIENT']),
  provider: z.enum(['ORIGINAL', 'YOUTUBE_EMBED', 'SPOTIFY_EMBED']),
  embedUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
  artworkUrl: z.string().optional(),
  durationSeconds: z.number().min(10).max(3600).default(180),
});

// GET /api/v1/music/playlists (Public playlists with active tracks)
router.get('/playlists', async (req, res, next) => {
  try {
    const playlists = await prisma.musicPlaylist.findMany({
      where: { isActive: true },
      include: {
        tracks: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return res.json({
      success: true,
      playlists,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/music/tracks (Public list of all active tracks by category)
router.get('/tracks', async (req, res, next) => {
  try {
    const { category } = req.query;
    const where: any = { isActive: true };

    if (category) {
      where.category = category as string;
    }

    const tracks = await prisma.musicTrack.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
    });

    return res.json({
      success: true,
      tracks,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/music/tracks (Admin only: Add new track)
router.post('/tracks', authenticate, requireRoles(['ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const data = trackSchema.parse(req.body);

    if (data.embedUrl && !isSafeEmbedUrl(data.embedUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid embed URL. Only verified YouTube and Spotify embeds are allowed.',
      });
    }

    const track = await prisma.musicTrack.create({
      data: {
        playlistId: data.playlistId,
        title: data.title,
        artist: data.artist,
        category: data.category,
        provider: data.provider,
        embedUrl: data.embedUrl,
        sourceUrl: data.sourceUrl,
        artworkUrl: data.artworkUrl,
        durationSeconds: data.durationSeconds,
      },
    });

    return res.status(201).json({
      success: true,
      track,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
