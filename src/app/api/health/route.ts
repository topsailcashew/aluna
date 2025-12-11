/**
 * Health Check Endpoint
 *
 * Provides basic health status for monitoring and load balancing.
 * Can be used by:
 * - Monitoring tools (Uptime Robot, Pingdom, etc.)
 * - Load balancers to check instance health
 * - CI/CD pipelines to verify deployment success
 *
 * @endpoint GET /api/health
 * @returns {object} Health status with timestamp and version
 */

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic'; // Disable caching

/**
 * GET /api/health
 *
 * Returns basic health status
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Basic health check
    const basicHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // Optional: Check Firestore connectivity
    // Uncomment if you want deep health checks
    /*
    try {
      const db = getAdminDb();
      await db.collection('health').limit(1).get();
      basicHealth.firestore = 'connected';
    } catch (error) {
      basicHealth.firestore = 'error';
      basicHealth.status = 'degraded';
    }
    */

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        ...basicHealth,
        responseTime: `${responseTime}ms`,
        uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'N/A',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // Even if health check fails, return 503 with error details
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
