import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          async
          defer
          crossOrigin="anonymous"
          src="https://connect.facebook.net/ar_AR/sdk.js"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.fbAsyncInit = function() {
                var appId = '${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''}';
                var version = '${process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || 'v18.0'}';
                if (!appId) {
                  console.error('Facebook App ID is not set (NEXT_PUBLIC_FACEBOOK_APP_ID)');
                  return;
                }
                if (!/^v\d+\.\d+$/.test(version)) {
                  console.error('Invalid Facebook API version:', version);
                  return;
                }
                FB.init({
                  appId: appId,
                  autoLogAppEvents: true,
                  xfbml: true,
                  version: version
                });
                try { window.__FB_INIT_DONE = true; } catch (e) {}
              };
            `,
          }}
        />
      </body>
    </Html>
  )
}