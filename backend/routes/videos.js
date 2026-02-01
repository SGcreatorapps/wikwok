import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import { storage } from '../config/cloudinary.js';

const router = express.Router();
const prisma = new PrismaClient();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

router.post('/upload', authenticateToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { caption } = req.body;
    // Cloudinary returns the full URL in req.file.path
    const videoUrl = req.file.path;
    // Generate thumbnail URL by adding Cloudinary transformation parameters
    const thumbnailUrl = req.file.path.replace('/upload/', '/upload/w_400,h_600,c_fill/');

    const video = await prisma.video.create({
      data: {
        caption: caption || '',
        videoUrl,
        thumbnailUrl,
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(video);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

router.get('/feed', async (req, res) => {
  try {
    const { cursor, limit = 10 } = req.query;
    
    const videos = await prisma.video.findMany({
      take: parseInt(limit),
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    const formattedVideos = videos.map(video => ({
      ...video,
      likesCount: video._count.likes,
      commentsCount: video._count.comments,
      _count: undefined
    }));

    res.json({
      videos: formattedVideos,
      nextCursor: videos.length === parseInt(limit) ? videos[videos.length - 1]?.id : null
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        },
        comments: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await prisma.video.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } }
    });

    res.json({
      ...video,
      likesCount: video._count.likes,
      commentsCount: video._count.comments,
      _count: undefined
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId
        }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      res.json({ liked: false });
    } else {
      await prisma.like.create({
        data: {
          userId,
          videoId
        }
      });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

router.get('/:id/like-status', authenticateToken, async (req, res) => {
  try {
    const like = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId: req.user.id,
          videoId: req.params.id
        }
      }
    });

    res.json({ liked: !!like });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check like status' });
  }
});

router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        userId: req.user.id,
        videoId: req.params.id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.get('/:id/comments', async (req, res) => {
  try {
    const { cursor, limit = 20 } = req.query;

    const comments = await prisma.comment.findMany({
      where: { videoId: req.params.id },
      take: parseInt(limit),
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      comments,
      nextCursor: comments.length === parseInt(limit) ? comments[comments.length - 1]?.id : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

export default router;
