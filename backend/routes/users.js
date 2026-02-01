import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.js';

const router = express.Router();
const prisma = new PrismaClient();

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tiktok-avatars',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }]
  }
});

const upload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            videos: true,
            followers: true,
            following: true
          }
        }
      }
    });

    res.json({
      ...user,
      password: undefined,
      videosCount: user._count.videos,
      followersCount: user._count.followers,
      followingCount: user._count.following
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/:username', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      include: {
        videos: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { likes: true, comments: true }
            }
          }
        },
        _count: {
          select: {
            videos: true,
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let isFollowing = false;
    if (req.headers.authorization) {
      try {
        const follow = await prisma.follow.findFirst({
          where: {
            followerId: req.user?.id,
            followingId: user.id
          }
        });
        isFollowing = !!follow;
      } catch (e) {}
    }

    res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
      videosCount: user._count.videos,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing,
      videos: user.videos.map(v => ({
        ...v,
        likesCount: v._count.likes,
        commentsCount: v._count.comments,
        _count: undefined
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const followerId = req.user.id;

    if (userId === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId,
        followingId: userId
      }
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      });
      res.json({ following: false });
    } else {
      await prisma.follow.create({
        data: {
          followerId,
          followingId: userId
        }
      });
      res.json({ following: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

router.put('/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { displayName, bio } = req.body;
    const updateData = {};

    if (displayName) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (req.file) updateData.avatar = req.file.path;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatar: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
