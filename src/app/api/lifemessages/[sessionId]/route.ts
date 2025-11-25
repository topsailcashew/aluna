import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * GET /api/lifemessages/[sessionId]
 * Get a specific session for authenticated user
 */
export async function GET(
  request: NextRequest,
  context: { params: { sessionId: string } }
) {
  return withAuth(
    async (req: NextRequest, { userId }) => {
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
  )(request);
}

/**
 * PATCH /api/lifemessages/[sessionId]
 * Update a specific session
 */
export async function PATCH(
  request: NextRequest,
  context: { params: { sessionId: string } }
) {
  return withAuth(
    async (req: NextRequest, { userId }) => {
      try {
        const body = await req.json();
        const { updates } = body;
        const { sessionId } = context.params;

        if (!updates) {
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
          ...updates,
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
  )(request);
}

/**
 * DELETE /api/lifemessages/[sessionId]
 * Delete a specific session
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { sessionId: string } }
) {
  return withAuth(
    async (req: NextRequest, { userId }) => {
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
  )(request);
}
