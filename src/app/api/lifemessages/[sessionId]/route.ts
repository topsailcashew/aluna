import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedHandler } from '@/lib/auth-middleware';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

type RouteContext = {
  params: {
    sessionId: string;
  };
};

/**
 * GET /api/lifemessages/[sessionId]
 * Get a specific session for authenticated user
 */
export const GET = withAuth(
  async (
    request: NextRequest,
    { userId },
    context: RouteContext
  ): Promise<NextResponse> => {
    try {
      const { sessionId } = context.params;

      const db = getAdminDb();
      const sessionRef = db.doc(`users/${userId}/lifeMessageSessions/${sessionId}`);
      const sessionSnap = await sessionRef.get();

      if (!sessionSnap.exists) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: sessionSnap.id,
        ...sessionSnap.data(),
      });
    } catch (error: any) {
      console.error('Error fetching session:', error);
      return NextResponse.json(
        { error: 'Failed to fetch session', details: error.message },
        { status: 500 }
      );
    }
  },
  { rateLimit: 'lifemessages' }
);

/**
 * PATCH /api/lifemessages/[sessionId]
 * Update a specific session
 */
export const PATCH = withAuth(
  async (
    request: NextRequest,
    { userId },
    context: RouteContext
  ): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const { sessionId } = context.params;

      if (!body) {
        return NextResponse.json({ error: 'Updates are required' }, { status: 400 });
      }

      const db = getAdminDb();
      const sessionRef = db.doc(`users/${userId}/lifeMessageSessions/${sessionId}`);

      // Check if session exists
      const sessionSnap = await sessionRef.get();
      if (!sessionSnap.exists) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      // Update session
      await sessionRef.update({
        ...body,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('Error updating session:', error);
      return NextResponse.json(
        { error: 'Failed to update session', details: error.message },
        { status: 500 }
      );
    }
  },
  { rateLimit: 'lifemessages' }
);

/**
 * DELETE /api/lifemessages/[sessionId]
 * Delete a specific session
 */
export const DELETE = withAuth(
  async (
    request: NextRequest,
    { userId },
    context: RouteContext
  ): Promise<NextResponse> => {
    try {
      const { sessionId } = context.params;

      const db = getAdminDb();
      const sessionRef = db.doc(`users/${userId}/lifeMessageSessions/${sessionId}`);

      // Check if session exists
      const sessionSnap = await sessionRef.get();
      if (!sessionSnap.exists) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      // Delete session
      await sessionRef.delete();

      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting session:', error);
      return NextResponse.json(
        { error: 'Failed to delete session', details: error.message },
        { status: 500 }
      );
    }
  },
  { rateLimit: 'lifemessages' }
);
