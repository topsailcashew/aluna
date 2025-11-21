import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase (server-side)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

/**
 * GET /api/lifemessages/[sessionId]?userId=xxx
 * Get a specific session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const { sessionId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    const sessionRef = doc(db, `users/${userId}/lifeMessageSessions/${sessionId}`);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
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
}

/**
 * PATCH /api/lifemessages/[sessionId]
 * Update a specific session
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const body = await request.json();
    const { userId, updates } = body;
    const { sessionId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    if (!updates) {
      return NextResponse.json({ error: 'Updates are required' }, { status: 400 });
    }

    const sessionRef = doc(db, `users/${userId}/lifeMessageSessions/${sessionId}`);

    // Check if session exists
    const sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists()) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update session
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lifemessages/[sessionId]
 * Delete a specific session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const { sessionId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    const sessionRef = doc(db, `users/${userId}/lifeMessageSessions/${sessionId}`);

    // Check if session exists
    const sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists()) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Delete session
    await deleteDoc(sessionRef);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session', details: error.message },
      { status: 500 }
    );
  }
}
