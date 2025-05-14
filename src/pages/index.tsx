import React from 'react';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import styles from '../styles/Home.module.css';

export default function Home() {
  const router = useRouter();
  
  const handleGetStarted = () => {
    router.push('/register');
  };
  
  const handleLogin = () => {
    router.push('/login');
  };
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>Indaba Care</h1>
          
          <div className={styles.headerButtons}>
            <button 
              className={styles.ghostButton}
              onClick={handleLogin}
            >
              Login
            </button>
            <button 
              className={styles.primaryButton}
              onClick={handleGetStarted}
            >
              Register
            </button>
          </div>
        </div>
      </header>
      
      <main className={styles.main}>
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>
              Childcare Management with Offline Capabilities
            </h2>
            
            <p className={styles.heroText}>
              Indaba Care helps parents and caregivers manage childcare activities efficiently,
              even without internet access. Track schedules, share photos, access resources,
              and more—all with a seamless offline-first experience.
            </p>
            
            <div className={styles.buttonGroup}>
              <button 
                className={styles.primaryButton}
                onClick={handleGetStarted}
              >
                Get Started
              </button>
              <button 
                className={styles.outlineButton}
                onClick={handleLogin}
              >
                Sign In
              </button>
            </div>
          </div>
          
          <div className={styles.heroImage}>
            <div className={styles.imageWrapper}>
              {/* Placeholder for hero image */}
              <div className={styles.imagePlaceholder}>App Screenshot</div>
            </div>
          </div>
        </div>
        
        <div className={styles.featuresSection}>
          <h3 className={styles.featuresTitle}>Key Features</h3>
          
          <div className={styles.featureCards}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🌐</div>
              <h4 className={styles.featureTitle}>Works Offline</h4>
              <p className={styles.featureDescription}>
                Continue using the app without internet. Data syncs automatically when you're back online.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>👶</div>
              <h4 className={styles.featureTitle}>Child Profiles</h4>
              <p className={styles.featureDescription}>
                Create detailed profiles with medical info, schedules, and preferences.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📷</div>
              <h4 className={styles.featureTitle}>Photo Sharing</h4>
              <p className={styles.featureDescription}>
                Capture and share special moments securely with family members.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📅</div>
              <h4 className={styles.featureTitle}>Schedule Tracking</h4>
              <p className={styles.featureDescription}>
                Manage nanny hours and childcare sessions efficiently.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBranding}>
            <h3 className={styles.footerLogo}>Indaba Care</h3>
            <p className={styles.footerCopyright}>
              &copy; {new Date().getFullYear()} Indaba Care. All rights reserved.
            </p>
          </div>
          
          <div className={styles.footerLinks}>
            <div className={styles.footerLinkGroup}>
              <h4 className={styles.footerLinkTitle}>Product</h4>
              <a href="#" className={styles.footerLink}>Features</a>
              <a href="#" className={styles.footerLink}>Security</a>
              <a href="#" className={styles.footerLink}>Privacy</a>
            </div>
            
            <div className={styles.footerLinkGroup}>
              <h4 className={styles.footerLinkTitle}>Support</h4>
              <a href="#" className={styles.footerLink}>Help Center</a>
              <a href="#" className={styles.footerLink}>Contact Us</a>
              <a href="#" className={styles.footerLink}>FAQs</a>
            </div>
            
            <div className={styles.footerLinkGroup}>
              <h4 className={styles.footerLinkTitle}>Company</h4>
              <a href="#" className={styles.footerLink}>About Us</a>
              <a href="#" className={styles.footerLink}>Careers</a>
              <a href="#" className={styles.footerLink}>Blog</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon}>{icon}</div>
      <h4 className={styles.featureTitle}>{title}</h4>
      <p className={styles.featureDescription}>{description}</p>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  // Simplified version without serverSideTranslations
  return {
    props: {
      // Empty props for now to get the application running
    },
  };
};
