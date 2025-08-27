// app/layout.tsx

import type { Metadata } from 'next';
import { Titillium_Web } from 'next/font/google';
import Script from 'next/script'; // Import the Script component
import './globals.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@near-wallet-selector/modal-ui/styles.css';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';

const titilliumWeb = Titillium_Web({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-titillium-web',
	weight: ['200', '300', '400', '600', '700', '900'],
});

// --- All your metadata goes here ---
export const metadata: Metadata = {
	title: 'GrantPicks',
	description:
		'Grants made fun! QUICKLY PICK YOUR FAVORITE PROJECTS, GET THEM FUNDED, AND WIN POINTS!',
	openGraph: {
		title: 'GrantPicks',
		description:
			'Grants made fun! QUICKLY PICK YOUR FAVORITE PROJECTS, GET THEM FUNDED, AND WIN POINTS!',
		url: 'https://grantpicks.com',
		siteName: 'GrantPicks',
		images: [
			{
				url: 'https://grantpicks.com/assets/images/GrantPicksMeta.png',
				width: 1200, // Optional: specify image dimensions
				height: 630, // Optional: specify image dimensions
			},
		],
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'GrantPicks',
		description:
			'Grants made fun! QUICKLY PICK YOUR FAVORITE PROJECTS, GET THEM FUNDED, AND WIN POINTS!',
		images: ['https://grantpicks.com/assets/images/GrantPicksMeta.png'],
	},
};

// Get the GA ID from environment variables
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			{/* The <head> tag is automatically managed by Next.js using the metadata object */}
			{/* Do NOT add a <Head> component here */}
			<body className={`${titilliumWeb.variable} font-titillium-web`}>
				<Providers>
					{children}
					<Toaster />
				</Providers>
			</body>

			{/* --- Google Analytics Scripts go here, outside the body --- */}
			{GA_MEASUREMENT_ID && (
				<>
					<Script
						src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
						strategy="afterInteractive"
					/>
					<Script id="google-analytics" strategy="afterInteractive">
						{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
					</Script>
				</>
			)}
		</html>
	);
}