import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCookieHeader, createJwt, mockJwtPayload, pkLive, pkTest } from '../../fixtures';
import { runtime } from '../../runtime';
import { getCookieSuffix } from '../../util/shared';
import { createAuthenticateContext } from '../authenticateContext';
import { createClerkRequest } from '../clerkRequest';

describe('AuthenticateContext', () => {
  const nowTimestampInSec = mockJwtPayload.iat;

  const suffixedSession = createJwt({ header: {} });
  const session = createJwt();
  const sessionWithInvalidIssuer = createJwt({ payload: { iss: 'http:whatever' } });
  const newSession = createJwt({ payload: { iat: nowTimestampInSec + 60 } });
  const clientUat = '1717490192';
  const suffixedClientUat = '1717490193';

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(nowTimestampInSec * 1000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('suffixedCookies', () => {
    describe('use un-suffixed cookies', () => {
      it('request with un-suffixed cookies', async () => {
        const headers = new Headers({
          cookie: createCookieHeader({
            __client_uat: clientUat,
            __session: session,
          }),
        });
        const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
        const context = await createAuthenticateContext(clerkRequest, {
          publishableKey: pkLive,
        });

        expect(context.usesSuffixedCookies()).toBe(false);
        expect(context.sessionTokenInCookie).toBe(session);
        expect(context.clientUat.toString()).toBe(clientUat);
      });

      it('request with suffixed and valid newer un-suffixed cookies - case of ClerkJS downgrade', async () => {
        const headers = new Headers({
          cookie: createCookieHeader({
            __client_uat: clientUat,
            __client_uat_MqCvchyS: suffixedClientUat,
            __session: newSession,
            __session_MqCvchyS: suffixedSession,
            __clerk_db_jwt: '__clerk_db_jwt',
            __clerk_db_jwt_MqCvchyS: '__clerk_db_jwt-suffixed',
          }),
        });
        const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
        const context = await createAuthenticateContext(clerkRequest, {
          publishableKey: pkLive,
        });

        expect(context.usesSuffixedCookies()).toBe(false);
        expect(context.sessionTokenInCookie).toBe(newSession);
        expect(context.clientUat.toString()).toBe(clientUat);
        expect(context.devBrowserToken).toBe('__clerk_db_jwt');
      });

      it('request with suffixed client_uat as signed-out and un-suffixed client_uat as signed-in - case of ClerkJS downgrade', async () => {
        const headers = new Headers({
          cookie: createCookieHeader({
            __client_uat: clientUat,
            __client_uat_vWCgMp3A: '0',
            __session: session,
            __clerk_db_jwt: '__clerk_db_jwt',
          }),
        });
        const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
        const context = await createAuthenticateContext(clerkRequest, {
          publishableKey: pkTest,
        });

        expect(context.usesSuffixedCookies()).toBe(false);
        expect(context.sessionTokenInCookie).toBe(session);
        expect(context.clientUat.toString()).toBe(clientUat);
      });

      it('prod: request with suffixed session and signed-out suffixed client_uat', async () => {
        const headers = new Headers({
          cookie: createCookieHeader({
            __client_uat: '0',
            __client_uat_MqCvchyS: '0',
            __session: session,
            __session_MqCvchyS: suffixedSession,
          }),
        });
        const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
        const context = await createAuthenticateContext(clerkRequest, {
          publishableKey: pkLive,
        });

        expect(context.usesSuffixedCookies()).toBe(true);
        expect(context.sessionTokenInCookie).toBe(suffixedSession);
        expect(context.clientUat.toString()).toBe('0');
      });
    });

    describe('use suffixed cookies', () => {
      it('prod: request with valid suffixed and un-suffixed cookies', async () => {
        const headers = new Headers({
          cookie: createCookieHeader({
            __client_uat: clientUat,
            __client_uat_MqCvchyS: suffixedClientUat,
            __session: session,
            __session_MqCvchyS: suffixedSession,
          }),
        });
        const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
        const context = await createAuthenticateContext(clerkRequest, {
          publishableKey: pkLive,
        });
        expect(context.usesSuffixedCookies()).toBe(true);
        expect(context.sessionTokenInCookie).toBe(suffixedSession);
        expect(context.clientUat.toString()).toBe(suffixedClientUat);
      });

      it('prod: request with invalid issuer un-suffixed and valid suffixed cookies - case of multiple apps on same eTLD+1 domain', async () => {
        const headers = new Headers({
          cookie: createCookieHeader({
            __client_uat: clientUat,
            __client_uat_MqCvchyS: suffixedClientUat,
            __session: sessionWithInvalidIssuer,
            __session_MqCvchyS: suffixedSession,
          }),
        });
        const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
        const context = await createAuthenticateContext(clerkRequest, {
          publishableKey: pkLive,
        });
        expect(context.usesSuffixedCookies()).toBe(true);
        expect(context.sessionTokenInCookie).toBe(suffixedSession);
        expect(context.clientUat.toString()).toBe(suffixedClientUat);
      });

      it('dev: request with invalid issuer un-suffixed and valid multiple suffixed cookies - case of multiple apps on localhost', async () => {
        const blahSession = createJwt({ payload: { iss: 'http://blah' } });
        const fooSession = createJwt({ payload: { iss: 'http://foo' } });
        const headers = new Headers({
          cookie: createCookieHeader({
            __client_uat: '0',
            __client_uat_vWCgMp3A: '0',
            __client_uat_8HKF1r6W: '1717490193',
            __client_uat_Rmi8c5i8: '1717490194',
            __session: session,
            __session_vWCgMp3A: suffixedSession,
            __session_8HKF1r6W: blahSession,
            __session_Rmi8c5i8: fooSession,
            __clerk_db_jwt: '__clerk_db_jwt',
            __clerk_db_jwt_vWCgMp3A: '__clerk_db_jwt-suffixed',
            __clerk_db_jwt_8HKF1r6W: '__clerk_db_jwt-suffixed-blah',
            __clerk_db_jwt_Rmi8c5i8: '__clerk_db_jwt-suffixed-foo',
          }),
        });
        const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
        const context = await createAuthenticateContext(clerkRequest, {
          publishableKey: pkTest,
        });

        expect(context.usesSuffixedCookies()).toBe(true);
        expect(context.sessionTokenInCookie).toBe(suffixedSession);
        expect(context.clientUat.toString()).toBe('0');
        expect(context.devBrowserToken).toBe('__clerk_db_jwt-suffixed');
      });

      it('dev: request with suffixed session and signed-out suffixed client_uat', async () => {
        const headers = new Headers({
          cookie: createCookieHeader({
            __client_uat: '0',
            __client_uat_vWCgMp3A: '0',
            __session: session,
            __session_vWCgMp3A: suffixedSession,
            __clerk_db_jwt: '__clerk_db_jwt',
            __clerk_db_jwt_vWCgMp3A: '__clerk_db_jwt-suffixed',
          }),
        });
        const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
        const context = await createAuthenticateContext(clerkRequest, {
          publishableKey: pkTest,
        });

        expect(context.usesSuffixedCookies()).toBe(true);
        expect(context.sessionTokenInCookie).toBe(suffixedSession);
        expect(context.clientUat.toString()).toBe('0');
        expect(context.devBrowserToken).toBe('__clerk_db_jwt-suffixed');
      });

      it('prod: request without suffixed session and signed-out suffixed client_uat', async () => {
        const headers = new Headers({
          cookie: createCookieHeader({
            __client_uat: '0',
            __client_uat_MqCvchyS: '0',
            __session: session,
          }),
        });
        const clerkRequest = createClerkRequest(new Request('http://example.com', { headers }));
        const context = await createAuthenticateContext(clerkRequest, {
          publishableKey: pkLive,
        });

        expect(context.usesSuffixedCookies()).toBe(true);
        expect(context.sessionTokenInCookie).toBeUndefined();
        expect(context.clientUat.toString()).toBe('0');
      });
    });
  });

  // Added these tests to verify that the generated sha-1 is the same as the one used in cookie assignment
  // Tests copied from packages/shared/src/__tests__/keys.test.ts
  describe('getCookieSuffix(publishableKey, subtle)', () => {
    it('given `pk_live_Y2xlcmsuY2xlcmsuZGV2JA` pk, returns `1Z8AzTQD` cookie suffix', async () => {
      expect(await getCookieSuffix('pk_live_Y2xlcmsuY2xlcmsuZGV2JA', runtime.crypto.subtle)).toBe('1Z8AzTQD');
    });

    it('given `pk_test_Y2xlcmsuY2xlcmsuZGV2JA` pk, returns `QvfNY2dr` cookie suffix', async () => {
      expect(await getCookieSuffix('pk_test_Y2xlcmsuY2xlcmsuZGV2JA', runtime.crypto.subtle)).toBe('QvfNY2dr');
    });

    it('omits special characters from the cookie suffix', async () => {
      const pk = 'pk_test_ZW5vdWdoLWFscGFjYS04Mi5jbGVyay5hY2NvdW50cy5sY2xjbGVyay5jb20k';
      expect(await getCookieSuffix(pk, runtime.crypto.subtle)).toBe('jtYvyt_H');
      const pk2 = 'pk_test_eHh4eHh4LXhhYWFhYS1hYS5jbGVyay5hY2NvdW50cy5sY2xjbGVyay5jb20k';
      expect(await getCookieSuffix(pk2, runtime.crypto.subtle)).toBe('tZJdb-5s');
    });
  });
});
