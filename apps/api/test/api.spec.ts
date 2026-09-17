import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { calculateVibeMatch } from '../src/common/utils/vibe-match.js';

describe('Agomoni Backend Test Suite', () => {
  describe('18+ Age Verification & Authentication', () => {
    it('should reject registration if user is under 18 years old', async () => {
      const underageDate = new Date();
      underageDate.setFullYear(underageDate.getFullYear() - 16); // 16 years old

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'underage@example.com',
          password: 'Password123!',
          displayName: 'Teen User',
          dateOfBirth: underageDate.toISOString().split('T')[0],
          gender: 'FEMALE',
          locationCity: 'Kolkata',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('18 years old');
    });

    it('should successfully register a user who is 18+ years old', async () => {
      const adultDate = new Date();
      adultDate.setFullYear(adultDate.getFullYear() - 22);

      const uniqueEmail = `testuser_${Date.now()}@agomoni.in`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'SecurePassword2026!',
          displayName: 'Puja Lover',
          dateOfBirth: adultDate.toISOString().split('T')[0],
          gender: 'MALE',
          locationCity: 'South Kolkata',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should authenticate user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@agomoni.in',
          password: 'AgomoniAdmin2026!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('ADMIN');
    });
  });

  describe('Vibe Match Engine', () => {
    it('should compute high vibe match score for overlapping puja day, time and interests', () => {
      const userA = {
        id: 'user-a',
        age: 23,
        locationCity: 'Kolkata',
        locationLat: 22.5726,
        locationLng: 88.3639,
        pujaDays: ['ASHTAMI', 'NABAMI'],
        timeSlots: ['EVENING'],
        interests: ['Pandal hopping', 'Food', 'Photography'],
        bio: 'Looking for a pandal hopping companion on Ashtami!',
      };

      const userB = {
        id: 'user-b',
        age: 24,
        locationCity: 'Kolkata',
        locationLat: 22.574,
        locationLng: 88.365,
        pujaDays: ['ASHTAMI', 'SAPTAMI'],
        timeSlots: ['EVENING'],
        interests: ['Food', 'Photography', 'Music'],
        bio: 'Ashtami evening anjali and street food hopping.',
      };

      const match = calculateVibeMatch(userA, userB);
      expect(match.vibeScore).toBeGreaterThanOrEqual(80);
      expect(match.reasons.length).toBeGreaterThan(0);
      expect(match.reasons.some((r) => r.includes('alone on') || r.includes('Ashtami'))).toBe(true);
    });
  });

  describe('Public Endpoints (Calendar & Music)', () => {
    it('should return active festival calendar and countdown without authentication', async () => {
      const res = await request(app).get('/api/v1/calendar/active');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.calendar.year).toBe(2026);
      expect(res.body.countdown).toBeDefined();
    });

    it('should return curated Puja music tracks and playlists', async () => {
      const res = await request(app).get('/api/v1/music/playlists');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.playlists.length).toBeGreaterThan(0);
    });

    it('should return verified emergency directory and national helplines', async () => {
      const res = await request(app).get('/api/v1/emergency/directory');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.nationalHelplines.length).toBeGreaterThan(0);
    });
  });

  describe('Lost & Found publication gate', () => {
    it('should keep a production-style listing pending until payment is verified', async () => {
      const uniqueEmail = `lost-found-test_${Date.now()}@agomoni.in`;
      const registration = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: uniqueEmail,
          password: 'SecurePassword2026!',
          displayName: 'Lost & Found Tester',
          dateOfBirth: '1995-01-01',
          gender: 'OTHER',
          locationCity: 'Kolkata',
        });

      expect(registration.status).toBe(201);

      const res = await request(app)
        .post('/api/v1/lost-found')
        .set('Authorization', `Bearer ${registration.body.token}`)
        .send({
          category: 'LOST_ITEM',
          title: 'Test umbrella',
          nameOrItem: 'Blue umbrella',
          description: 'A temporary test listing for payment-gate verification.',
          lastSeenArea: 'Kolkata',
          lastSeenDate: '2026-10-18T10:00:00.000Z',
        });

      expect(res.status).toBe(201);
      expect(res.body.requiresPayment).toBe(false);
      expect(res.body.post.status).toBe('ACTIVE');
      expect(res.body.post.isPaid).toBe(true);
    });
  });
});
