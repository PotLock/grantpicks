// app/layout.tsx

import type { Metadata } from 'next';
import { Titillium_Web } from 'next/font/google';
import Script from 'next/script'; // 1. Import the Script component
import './globals.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@near-wallet-selector/modal-ui/styles.css';
import WalletProvider from './providers/WalletProvider';
import ModalProvider from './providers/ModalProvider';
import { Toaster } from 'react-hot-toast';
import GlobalProvider from './providers/GlobalProvider';

const titiliumWeb = Titillium_Web({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-titilium-web',
	weight: ['200', '300', '400', '600', '700', '900'],
});

// 2. All meta tags are moved into this object
export const metadata: Metadata = {
	title: 'GrantPicks',
	description:
		'Grants made fun! QUICKLY PICK YOUR FAVORITE PROJECTS, GET THEM FUNDED, AND WIN POINTS!',
	openGraph: {
		title: 'GrantPicks',
		description:
			'Grants made fun! QUICKLY PICK YOUR FAVORITE PROJECTS, GET THEM FUNDED, AND WIN POINTS!',
		url: 'https://grantpicks.com',
		images: [
			{
				url: 'https://grantpicks.com/assets/images/GrantPicksMeta.png',
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

// 3. Get your Measurement ID from environment variables
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			{/* The <Head> component from next/head has been removed. */}
			{/* Next.js now handles the <head> tag automatically using the metadata object above. */}
			<body className={titiliumWeb.className}>
				<GlobalProvider>
					<WalletProvider>
						<ModalProvider>
							{children}
							<Toaster />
						</ModalProvider>
					</WalletProvider>
				</GlobalProvider>
			</body>

			{/* 4. Add the Google Analytics scripts here */}
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