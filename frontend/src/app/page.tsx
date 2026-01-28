'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { dealsApi } from '@/lib/api';
import DealCard from '@/components/DealCard';
import { DealsGridSkeleton } from '@/components/Loaders';

interface Deal {
  _id: string;
  title: string;
  shortDescription?: string;
  partner: { name: string; logo?: string };
  category: string;
  discountType: string;
  discountValue: string;
  isLocked: boolean;
  featured?: boolean;
}

const partners = [
  { name: 'AWS', color: '#FF9900' },
  { name: 'Notion', color: '#000000' },
  { name: 'Stripe', color: '#635BFF' },
  { name: 'Figma', color: '#F24E1E' },
  { name: 'MongoDB', color: '#00ED64' },
  { name: 'Slack', color: '#4A154B' },
];

const stats = [
  { value: '$2M+', label: 'Total Savings' },
  { value: '150+', label: 'Active Deals' },
  { value: '10K+', label: 'Startups Helped' },
  { value: '50+', label: 'Partners' },
];

export default function HomePage() {
  const [featuredDeals, setFeaturedDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await dealsApi.getFeatured();
        setFeaturedDeals(response.data.data);
      } catch (err) {
        console.log('Failed to fetch featured deals');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[90vh] flex items-center justify-center px-6"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-zinc-300">Saving startups $2M+ in tools</span>
            </motion.div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Premium Tools,{' '}
              <span className="gradient-text">Startup Prices</span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Access exclusive deals on the best SaaS products.
              Save thousands on cloud services, marketing tools, and more.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/deals" className="btn-primary text-lg px-8 py-4 inline-block">
                  Explore Deals
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/register" className="btn-secondary text-lg px-8 py-4 inline-block">
                  Get Started Free
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-zinc-600 flex justify-center pt-2"
          >
            <div className="w-1.5 h-3 rounded-full bg-zinc-500" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Partners Section */}
      <section className="py-20 px-6 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-zinc-500 mb-10"
          >
            Trusted by leading companies worldwide
          </motion.p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {partners.map((partner, i) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-2xl font-bold text-zinc-600 hover:text-zinc-400 transition-colors cursor-default"
              >
                {partner.name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Deals Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured <span className="gradient-text">Deals</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Hand-picked deals to help you build and scale your startup
            </p>
          </motion.div>

          {loading ? (
            <DealsGridSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDeals.slice(0, 6).map((deal, index) => (
                <DealCard key={deal._id} deal={deal} index={index} />
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/deals" className="btn-secondary inline-block">
              View All Deals →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Startups <span className="gradient-text">Choose Us</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Curated Deals',
                description: 'Hand-picked deals from top SaaS providers, verified and updated regularly.'
              },
              {
                icon: '⚡',
                title: 'Instant Access',
                description: 'Claim deals instantly and start using premium tools within minutes.'
              },
              {
                icon: '🔒',
                title: 'Exclusive Benefits',
                description: 'Access locked deals with verification to get even better discounts.'
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-light rounded-2xl p-8 text-center card-hover"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative gradient-border p-12 md:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Save Thousands?
              </h2>
              <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                Join thousands of startups already saving on their favorite tools.
              </p>
              <Link href="/register" className="btn-primary text-lg px-10 py-4 inline-block">
                Start Saving Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
