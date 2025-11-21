import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase (server-side)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

/**
 * POST /api/lifemessages
 * Create a new life messages session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    if (!sessionData) {
      return NextResponse.json({ error: 'Session data is required' }, { status: 400 });
    }

    // Add session to Firestore
    const sessionsRef = collection(db, `users/${userId}/lifeMessageSessions`);
    const docRef = await addDoc(sessionsRef, {
      ...sessionData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
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
}

/**
 * GET /api/lifemessages?userId=xxx
 * Get all sessions for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 401 });
    }

    const sessionsRef = collection(db, `users/${userId}/lifeMessageSessions`);
    const q = query(sessionsRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

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
}
