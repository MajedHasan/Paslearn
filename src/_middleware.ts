// import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
// export default authMiddleware({
//   publicRoutes: ["/site", "/", "/api/uploadthing"],
//   async beforeAuth(auth, req) {},
//   async afterAuth(auth, req) {
//     //rewrite for domains
//     const url = req.nextUrl;
//     const searchParams = url.searchParams.toString();
//     let hostname = req.headers;

//     // const pathWithSearchParams = `${url.pathname}${
//     //   searchParams.length > 0 ? `?${searchParams}` : ""
//     // }`;

//     // //if subdomain exists
//     // const customSubDomain = hostname
//     //   .get("host")
//     //   ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
//     //   .filter(Boolean)[0];

//     // if (customSubDomain) {
//     //   return NextResponse.rewrite(
//     //     new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
//     //   );
//     // }

//     if (url.pathname === "/sign-in") {
//       return NextResponse.redirect(new URL(`/site/sign-in`, req.url));
//     }

//     // ================== For Marketplace Page
//     if (
//       url.pathname === "/marketplace" &&
//       url.host === process.env.NEXT_PUBLIC_DOMAIN
//     ) {
//       return NextResponse.rewrite(new URL("/site/marketplace", req.url));
//     }

//     // ================== For Contact Page
//     if (
//       url.pathname === "/contact" &&
//       url.host === process.env.NEXT_PUBLIC_DOMAIN
//     ) {
//       return NextResponse.rewrite(new URL("/site/contact", req.url));
//     }

//     // ================== For About Us Page
//     if (
//       url.pathname === "/about-us" &&
//       url.host === process.env.NEXT_PUBLIC_DOMAIN
//     ) {
//       return NextResponse.rewrite(new URL("/site/about-us", req.url));
//     }

//     // ================== For Pricing Page
//     if (
//       url.pathname === "/pricing" &&
//       url.host === process.env.NEXT_PUBLIC_DOMAIN
//     ) {
//       return NextResponse.rewrite(new URL("/site/pricing", req.url));
//     }

//     // ================== For Road Map Page
//     if (
//       url.pathname === "/road-map" &&
//       url.host === process.env.NEXT_PUBLIC_DOMAIN
//     ) {
//       return NextResponse.rewrite(new URL("/site/road-map", req.url));
//     }

//     // ================== For Home Page
//     if (
//       url.pathname === "/" ||
//       (url.pathname === "/site" && url.host === process.env.NEXT_PUBLIC_DOMAIN)
//     ) {
//       return NextResponse.rewrite(new URL("/site", req.url));
//     }
//   },
// });

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
