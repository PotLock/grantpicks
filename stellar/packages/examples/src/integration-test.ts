import dotenv from 'dotenv'
import CMDWallet from './wallet.js'
import App from './app.js'
import { generateFakeRound } from './tests/index.js'
dotenv.config()

async function main() {
	await generateFakeRound()

	process.exit(0)
}

main()


// 1. EcoChain Tracker
// Description: A blockchain-based platform for tracking carbon credits and environmental impact. Real-time monitoring of sustainability initiatives with transparent, immutable records. Empowering organizations to verify their green commitments.
// 2. LearnWeb3 Academy
// Description: Free, open-source educational platform teaching Web3 development to underrepresented communities. Interactive tutorials, coding challenges, and mentorship programs. Building the next generation of blockchain developers.
// 3. HealthBridge Protocol
// Description: Decentralized healthcare data sharing platform ensuring patient privacy while enabling medical research. Patients control their data and can contribute to studies while maintaining anonymity. Bridging healthcare innovation with privacy.
// 4. LocalFood Network
// Description: Connecting local farmers directly with consumers using smart contracts for transparent supply chains. Reducing food waste, supporting local economies, and ensuring fair prices for producers. Community-driven food security.
// 5. ArtVault Marketplace
// Description: NFT marketplace focused on emerging artists from developing countries. Low fees, educational resources, and community support. Democratizing access to digital art markets and empowering creators globally.
// 6. Code4Good Initiative
// Description: Open-source platform matching developers with non-profit organizations needing technical solutions. Volunteer developers contribute skills to social impact projects. Technology for social change.
// 7. Renewable Energy Tracker
// Description: Blockchain-based system tracking renewable energy production and distribution. Enables peer-to-peer energy trading and transparent carbon offset verification. Accelerating the transition to clean energy.
// 8. EduDAO Platform
// Description: Decentralized autonomous organization managing educational grants and scholarships. Community-governed funding decisions for students worldwide. Making education accessible through blockchain governance.
// 9. WaterWise Network
// Description: IoT and blockchain solution for monitoring water quality and distribution in underserved communities. Real-time data collection and transparent resource allocation. Ensuring clean water access for all.
// 10. MicroLoan Protocol
// Description: DeFi platform providing microloans to small businesses in developing regions. Low-interest rates, community-backed loans, and transparent repayment tracking. Financial inclusion through decentralized finance.



// Title: “Community Tools Grant”
// Description: Support open-source tooling that helps local communities run smoother operations—project management, impact tracking, or community governance platforms.
// Title: “Climate Action Builders”
// Description: Fund projects that accelerate measurable climate action—carbon capture pilots, clean energy deployments, or accessibility tools for green tech.
// Title: “Web3 Literacy Accelerator”
// Description: Back educational programs that demystify Web3 for newcomers (videos, workshops, mentorship) with an emphasis on inclusion and practical skill-building.
// Title: “Public Data Commons”
// Description: Invest in transparent public datasets or infrastructure that makes civic data, environmental telemetry, or community research easy to access and reuse.
// Title: “Stable Community Infrastructure”
// Description: Fund efforts that strengthen community infrastructure—identity, wallets, dispute resolution, or coordination tooling—for resilient ecosystems.
// Title: “Health & Wellness Open Labs”
// Description: Support decentralized health tools targeting underserved communities—mental health platforms, telemedicine hubs, or health literacy initiatives.
// Title: “Creative Economy Catalyst”
// Description: Back artists and creators bringing new digital art, media, or cultural tools to life on decentralized platforms with a focus on fair compensation.
// Title: “Future of Work Experiments”
// Description: Fund projects reimagining distributed work—collaboration tools, asynchronous workflows, or new community-driven employment models.
// Title: “Financial Inclusion Sprint”
// Description: Back initiatives that extend access to savings, credit, or transparent funding to people outside the traditional banking system via DeFi or local currencies.
// Title: “Open Science Challenge”
// Description: Support reproducible, open scientific work—data platforms, lab automation, or citizen science projects that invite community collaboration.
// Let me know if you’d like one tailored to a specific sector (e.g., Web3 infrastructure, health, education, climate).