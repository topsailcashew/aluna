import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedHandler } from '@/lib/auth-middleware';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * POST /api/lifemessages
 * Create a new life messages session
 */
export const POST: AuthenticatedHandler = withAuth(
  async (request: NextRequest, { userId }) => {
    try {
      const body = await request.json();
      const { sessionData } = body;

      if (!sessionData) {
        return NextResponse.json({ error: 'Session data is required' }, { status: 400 });
      }

      // Add session to Firestore using Admin SDK
      const db = getAdminDb();
      const sessionsRef = db.collection(`users/${userId}/lifeMessageSessions`);
      const docRef = await sessionsRef.add({
        ...sessionData,
        userId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        sessionId: docRef.id,
      });
    } catch (error: any) {
      console.error('Error creating life messages session:', error);
      return NextResponse.json(
        { error: 'Failed to create session', details: error.message },
        { status: 500 }
      );
    }
  },
  { rateLimit: 'lifemessages' }
);

/**
 * GET /api/lifemessages
 * Get all sessions for authenticated user
 */
export const GET: AuthenticatedHandler = withAuth(
  async (request: NextRequest, { userId }) => {
    try {
      const db = getAdminDb();
      const sessionsRef = db.collection(`users/${userId}/lifeMessageSessions`);
      const snapshot = await sessionsRef.orderBy('updatedAt', 'desc').get();

      const sessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json({ sessions });
    } catch (error: any) {
      console.error('Error fetching life messages sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions', details: error.message },
        { status: 500 }
      );
    }
  },
  { rateLimit: 'lifemessages' }
);
