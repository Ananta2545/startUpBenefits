require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Deal = require('./models/Deal');
const User = require('./models/User');

const sampleDeals = [
    {
        title: '$10,000 in AWS Credits for Startups',
        description: 'Get up to $10,000 in AWS credits to build and scale your startup infrastructure. This offer includes access to AWS Activate portfolio, technical support, and training resources. Perfect for early-stage startups looking to build on reliable cloud infrastructure without upfront costs.',
        shortDescription: 'Up to $10,000 in cloud credits for your startup',
        partner: {
            name: 'Amazon Web Services',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
            website: 'https://aws.amazon.com',
            description: 'The world\'s most comprehensive cloud platform'
        },
        category: 'cloud',
        discountType: 'credits',
        discountValue: '$10,000',
        originalPrice: '$10,000',
        isLocked: false,
        eligibility: 'Startups less than 10 years old, raised under $100M',
        terms: 'Credits valid for 2 years. Must be a new AWS customer or have less than $1000 in previous usage.',
        claimInstructions: 'Apply through AWS Activate portal with your startup details',
        featured: true
    },
    {
        title: 'Notion: 6 Months Free Plus AI',
        description: 'Collaboration and documentation platform with unlimited blocks and AI-powered features. Notion combines notes, docs, wikis, and project management into one tool. This deal includes access to Notion AI for unlimited team members.',
        shortDescription: 'Free workspace with AI features for 6 months',
        partner: {
            name: 'Notion',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
            website: 'https://notion.so',
            description: 'All-in-one workspace for your notes, tasks, wikis, and databases'
        },
        category: 'productivity',
        discountType: 'free_tier',
        discountValue: '6 months free',
        originalPrice: '$10/user/month',
        isLocked: false,
        eligibility: 'All startups',
        terms: 'Valid for teams up to 50 members',
        claimInstructions: 'Sign up with your startup email and verify your company',
        featured: true
    },
    {
        title: 'Stripe: Waived Processing Fees',
        description: 'Process your first $50,000 in payments with zero processing fees. Stripe is the leading payment infrastructure for the internet, trusted by millions of businesses worldwide. This exclusive deal helps you keep more of your revenue in the crucial early stages.',
        shortDescription: 'Zero fees on first $50K in transactions',
        partner: {
            name: 'Stripe',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
            website: 'https://stripe.com',
            description: 'Financial infrastructure for the internet'
        },
        category: 'finance',
        discountType: 'credits',
        discountValue: '~$1,450 in savings',
        originalPrice: '2.9% + $0.30 per transaction',
        isLocked: true,
        eligibility: 'Verified startups with incorporated business',
        terms: 'New Stripe accounts only. Processing fee waiver applies to first $50,000 volume.',
        claimInstructions: 'Submit verification documents through the platform',
        featured: true
    },
    {
        title: 'Figma: 1 Year Professional Plan',
        description: 'Get a full year of Figma Professional for your entire design team. Includes unlimited projects, version history, private projects, and advanced prototyping. Essential for product teams building modern digital experiences.',
        shortDescription: 'Full year of professional design tools',
        partner: {
            name: 'Figma',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg',
            website: 'https://figma.com',
            description: 'Collaborative interface design tool'
        },
        category: 'design',
        discountType: 'free_tier',
        discountValue: '1 year free',
        originalPrice: '$15/editor/month',
        isLocked: false,
        eligibility: 'Teams under 10 designers',
        terms: 'Applies to Professional tier only',
        claimInstructions: 'Apply through Figma for Startups program',
        featured: true
    },
    {
        title: 'MongoDB Atlas: $3,000 Credits',
        description: 'Build modern applications with the developer data platform. Get $3,000 in credits for MongoDB Atlas, the fully managed cloud database. Includes automatic scaling, backups, and enterprise-grade security.',
        shortDescription: 'Database credits for your applications',
        partner: {
            name: 'MongoDB',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg',
            website: 'https://mongodb.com',
            description: 'The developer data platform'
        },
        category: 'development',
        discountType: 'credits',
        discountValue: '$3,000',
        originalPrice: '$3,000',
        isLocked: false,
        eligibility: 'All startups with less than $5M in funding',
        terms: 'Credits valid for 12 months',
        claimInstructions: 'Apply through MongoDB for Startups',
        featured: false
    },
    {
        title: 'HubSpot: 90% Off First Year',
        description: 'Complete CRM platform with marketing, sales, and service hubs. HubSpot helps you grow better with tools that are powerful alone, but even better together. This deal includes access to Marketing Hub, Sales Hub, and Service Hub Professional.',
        shortDescription: 'CRM and marketing automation at 90% off',
        partner: {
            name: 'HubSpot',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/HubSpot_Logo.svg',
            website: 'https://hubspot.com',
            description: 'Grow better with HubSpot'
        },
        category: 'marketing',
        discountType: 'percentage',
        discountValue: '90% off',
        originalPrice: '$890/month',
        isLocked: true,
        eligibility: 'Verified startups with VC backing or accelerator participation',
        terms: 'Discount applies to first year only. Renewal at standard rates.',
        claimInstructions: 'Apply through HubSpot for Startups with proof of funding',
        featured: false
    },
    {
        title: 'Mixpanel: $50,000 Credits',
        description: 'Product analytics that help you build better products. Mixpanel tracks user interactions and provides insights to help you understand what drives conversions, engagement, and retention.',
        shortDescription: 'Analytics credits to understand your users',
        partner: {
            name: 'Mixpanel',
            logo: 'https://cdn.worldvectorlogo.com/logos/mixpanel.svg',
            website: 'https://mixpanel.com',
            description: 'Product analytics for product people'
        },
        category: 'analytics',
        discountType: 'credits',
        discountValue: '$50,000',
        originalPrice: '$50,000',
        isLocked: true,
        eligibility: 'Series A or earlier stage startups',
        terms: 'Credits valid for 1 year',
        claimInstructions: 'Submit company verification for approval',
        featured: true
    },
    {
        title: 'Slack: 25% Off Business+',
        description: 'Connect your team with channels, messaging, and integrations. Slack brings all your communication together, giving everyone a shared workspace where conversations are organized and accessible.',
        shortDescription: 'Team communication at startup-friendly pricing',
        partner: {
            name: 'Slack',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
            website: 'https://slack.com',
            description: 'Where work happens'
        },
        category: 'communication',
        discountType: 'percentage',
        discountValue: '25% off',
        originalPrice: '$12.50/user/month',
        isLocked: false,
        eligibility: 'All startups',
        terms: 'Discount valid for 12 months',
        claimInstructions: 'Apply through Slack for Startups',
        featured: false
    },
    {
        title: 'GitHub: Enterprise Free for 1 Year',
        description: 'The complete developer platform to build, scale, and deliver secure software. GitHub Enterprise includes advanced security features, compliance controls, and enterprise-grade support.',
        shortDescription: 'Enterprise features at no cost for a year',
        partner: {
            name: 'GitHub',
            logo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            website: 'https://github.com',
            description: 'Where the world builds software'
        },
        category: 'development',
        discountType: 'free_tier',
        discountValue: '1 year free',
        originalPrice: '$21/user/month',
        isLocked: false,
        eligibility: 'Startups under 20 employees',
        terms: 'Maximum 20 seats covered',
        claimInstructions: 'Apply through GitHub for Startups program',
        featured: false
    },
    {
        title: 'Intercom: 95% Off for 12 Months',
        description: 'Customer messaging platform with live chat, bots, and product tours. Intercom helps you build customer relationships through personalized, messenger-based experiences across the customer journey.',
        shortDescription: 'Customer messaging at 95% discount',
        partner: {
            name: 'Intercom',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Intercom_logo.svg',
            website: 'https://intercom.com',
            description: 'The future of customer communication'
        },
        category: 'communication',
        discountType: 'percentage',
        discountValue: '95% off',
        originalPrice: '$99/month',
        isLocked: true,
        eligibility: 'Early stage startups with less than $1M in funding',
        terms: 'Growth plan features included',
        claimInstructions: 'Provide proof of funding stage',
        featured: false
    },
    {
        title: 'Vercel: Pro Plan Free for 6 Months',
        description: 'The platform for frontend developers, providing speed and reliability to deploy and scale your applications. Includes unlimited deployments, preview URLs, and analytics.',
        shortDescription: 'Premium frontend hosting at no cost',
        partner: {
            name: 'Vercel',
            logo: 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png',
            website: 'https://vercel.com',
            description: 'Develop. Preview. Ship.'
        },
        category: 'cloud',
        discountType: 'free_tier',
        discountValue: '6 months free',
        originalPrice: '$20/user/month',
        isLocked: false,
        eligibility: 'All startups',
        terms: 'Pro tier features for team up to 10 members',
        claimInstructions: 'Sign up and apply through Vercel Startup Program',
        featured: false
    },
    {
        title: 'Amplitude: $5,000 Analytics Credits',
        description: 'Digital analytics platform that helps you understand user behavior. Build better products by discovering what users love, where they struggle, and how to grow.',
        shortDescription: 'Product analytics to drive growth',
        partner: {
            name: 'Amplitude',
            logo: 'https://amplitude.com/images/og/og-amplitude.png',
            website: 'https://amplitude.com',
            description: 'Digital analytics for product teams'
        },
        category: 'analytics',
        discountType: 'credits',
        discountValue: '$5,000',
        originalPrice: '$5,000',
        isLocked: true,
        eligibility: 'Pre-Series B startups',
        terms: 'Growth plan access for 1 year',
        claimInstructions: 'Submit verification through our portal',
        featured: false
    }
];

async function seedDatabase() {
    try {
        await connectDB();

        // clear existing data
        await Deal.deleteMany({});
        console.log('Cleared existing deals');

        // insert sample deals
        await Deal.insertMany(sampleDeals);
        console.log('Inserted sample deals');

        // create a test verified user
        const existingUser = await User.findOne({ email: 'demo@startup.com' });
        if (!existingUser) {
            await User.create({
                email: 'demo@startup.com',
                password: 'demo123',
                name: 'Demo User',
                companyName: 'Demo Startup Inc',
                companySize: '1-10',
                isVerified: true
            });
            console.log('Created demo user (demo@startup.com / demo123)');
        }

        // create admin user
        const existingAdmin = await User.findOne({ email: 'admin@startup.com' });
        if (!existingAdmin) {
            await User.create({
                email: 'admin@startup.com',
                password: 'admin123',
                name: 'Admin User',
                companyName: 'Startup Benefits',
                role: 'admin',
                isVerified: true
            });
            console.log('Created admin user (admin@startup.com / admin123)');
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seedDatabase();
