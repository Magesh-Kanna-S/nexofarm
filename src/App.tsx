import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Advisory, Order, BasketItem, PreOrderRequest } from './types';
import { 
  Leaf, Sprout, ShoppingBasket, LayoutDashboard, LogOut, Loader2, 
  MapPin, CheckCircle2, ChevronRight, AlertCircle, Sun, Moon, 
  User as UserIcon, TrendingUp, Package, Truck, History, Search,
  MessageSquare, Plus, Info, Wind, Droplets, Thermometer,
  Calendar, ShieldCheck, BarChart3, Globe, CreditCard, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'react-hot-toast';
import { cn } from './lib/utils';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";

// --- Mock Data ---

const SAMPLE_ADVISORIES: Advisory[] = [
  {
    advisoryId: 'adv1',
    farmerUid: 'farmer1',
    clusterId: 'cluster1',
    crop: 'Organic Spinach',
    recommendedQuantity: 450,
    sowingWindow: 'April 1st - April 10th',
    harvestTimeline: 'Late May',
    reasoning: 'Demand in your 5km cluster has spiked by 35% due to new health-conscious subscriptions.',
    healthStatus: 'Excellent',
    pestRisk: 'Low',
    lat: 12.9716,
    lng: 77.5946
  },
  {
    advisoryId: 'adv2',
    farmerUid: 'farmer1',
    clusterId: 'cluster1',
    crop: 'Cherry Tomatoes',
    recommendedQuantity: 800,
    sowingWindow: 'April 5th - April 20th',
    harvestTimeline: 'July',
    reasoning: 'Stable demand from 42 households. High yield expected this season.',
    healthStatus: 'Good',
    pestRisk: 'Medium',
    lat: 12.9750,
    lng: 77.5980
  },
  {
    advisoryId: 'adv3',
    farmerUid: 'farmer1',
    clusterId: 'cluster1',
    crop: 'Bell Peppers',
    recommendedQuantity: 300,
    sowingWindow: 'April 15th - April 30th',
    harvestTimeline: 'August',
    reasoning: 'Low current supply in your cluster. Opportunity for premium pricing.',
    healthStatus: 'Fair',
    pestRisk: 'High',
    lat: 12.9680,
    lng: 77.5920
  }
];

const SAMPLE_ITEMS: BasketItem[] = [
  { 
    id: 1, 
    name: 'Fresh Spinach', 
    price: 40, 
    unit: 'bunch', 
    farm: 'Green Valley Farm', 
    stock: 45, 
    quantity: 0,
    healthBenefits: 'Rich in iron, vitamins A and C. Supports bone health and immune system.',
    cookingTips: 'Best sautéed with garlic or added fresh to smoothies and salads.',
    popularity: 'Top 5% in your cluster',
    funFact: 'Spinach was the first vegetable to be sold in frozen form in 1930.'
  },
  { 
    id: 2, 
    name: 'Organic Tomatoes', 
    price: 60, 
    unit: 'kg', 
    farm: 'Sunshine Acres', 
    stock: 120, 
    quantity: 0,
    healthBenefits: 'High in lycopene, an antioxidant that supports heart health.',
    cookingTips: 'Perfect for slow-cooked sauces or fresh in Caprese salads.',
    popularity: 'Bought by 85% of households nearby',
    funFact: 'Tomatoes are technically fruits, but legally classified as vegetables in the US.'
  },
  { 
    id: 3, 
    name: 'Local Carrots', 
    price: 45, 
    unit: 'kg', 
    farm: 'Root & Soil', 
    stock: 80, 
    quantity: 0,
    healthBenefits: 'Excellent source of beta-carotene and fiber for eye health.',
    cookingTips: 'Roast with honey and thyme for a sweet, savory side dish.',
    popularity: 'Steady demand year-round',
    funFact: 'The first carrots were actually purple or white, not orange!'
  },
  { 
    id: 4, 
    name: 'Bell Peppers', 
    price: 80, 
    unit: 'kg', 
    farm: 'Green Valley Farm', 
    stock: 30, 
    quantity: 0,
    healthBenefits: 'Packed with vitamin C—more than an orange!',
    cookingTips: 'Stuff with quinoa and veggies for a healthy main course.',
    popularity: 'Premium choice in your area',
    funFact: 'Green peppers are just unripe red peppers.'
  },
  { 
    id: 5, 
    name: 'Sweet Corn', 
    price: 20, 
    unit: 'ear', 
    farm: 'Sunshine Acres', 
    stock: 200, 
    quantity: 0,
    healthBenefits: 'Provides lutein and zeaxanthin for vision protection.',
    cookingTips: 'Grill with butter and chili lime for a classic street-style snack.',
    popularity: 'Seasonal favorite',
    funFact: 'An average ear of corn has an even number of rows, usually 16.'
  },
  { 
    id: 6, 
    name: 'Red Onions', 
    price: 35, 
    unit: 'kg', 
    farm: 'Root & Soil', 
    stock: 150, 
    quantity: 0,
    healthBenefits: 'Contains quercetin, which has anti-inflammatory properties.',
    cookingTips: 'Pickle in vinegar for a crunchy, tangy addition to tacos.',
    popularity: 'Kitchen staple',
    funFact: 'Onions have been used as a form of currency in some ancient cultures.'
  },
];

const SAMPLE_PRE_ORDERS: PreOrderRequest[] = [
  { id: 'pre1', consumerUid: 'cons1', crop: 'Broccoli', quantity: 2, unit: 'kg', maxPrice: 120, deadline: '2026-04-15', status: 'open' },
  { id: 'pre2', consumerUid: 'cons2', crop: 'Strawberries', quantity: 1, unit: 'kg', maxPrice: 300, deadline: '2026-04-20', status: 'open' },
];

const ANALYTICS_DATA = [
  { name: 'Mon', demand: 400, supply: 240 },
  { name: 'Tue', demand: 300, supply: 139 },
  { name: 'Wed', demand: 200, supply: 980 },
  { name: 'Thu', demand: 278, supply: 390 },
  { name: 'Fri', demand: 189, supply: 480 },
  { name: 'Sat', demand: 239, supply: 380 },
  { name: 'Sun', demand: 349, supply: 430 },
];

const WEATHER_DATA = {
  temp: 28,
  condition: 'Partly Cloudy',
  humidity: 65,
  wind: 12,
  forecast: [
    { day: 'Mon', temp: 29, icon: Sun },
    { day: 'Tue', temp: 27, icon: Wind },
    { day: 'Wed', temp: 26, icon: Droplets },
    { day: 'Thu', temp: 28, icon: Sun },
    { day: 'Fri', temp: 30, icon: Sun },
  ]
};

const MapComponent = ({ lat, lng, zoom = 13 }: { lat: number; lng: number; zoom?: number }) => (
  <div className="w-full h-64 rounded-2xl overflow-hidden border border-emerald-100 dark:border-gray-800 shadow-sm relative group">
    <iframe
      width="100%"
      height="100%"
      frameBorder="0"
      style={{ border: 0 }}
      src={`https://www.google.com/maps/embed/v1/view?key=${process.env.GOOGLE_MAPS_API_KEY || ''}&center=${lat},${lng}&zoom=${zoom}&maptype=satellite`}
      allowFullScreen
      title="Farm Map"
      className="opacity-80 group-hover:opacity-100 transition-opacity"
    ></iframe>
    {!process.env.GOOGLE_MAPS_API_KEY && (
      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-10 h-10 text-emerald-600 mb-2" />
        <p className="text-sm font-medium text-gray-900 dark:text-white">Live Satellite View (Cluster {lat.toFixed(2)}, {lng.toFixed(2)})</p>
        <p className="text-xs text-gray-500 mt-1 italic">Integrating with Google Earth Engine for crop health monitoring...</p>
      </div>
    )}
  </div>
);

// --- Components ---

const Button = ({ children, onClick, className, variant = 'primary', disabled, loading }: any) => {
  const variants: any = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md dark:bg-emerald-500 dark:hover:bg-emerald-600',
    secondary: 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 dark:bg-gray-800 dark:text-emerald-400 dark:border-gray-700 dark:hover:bg-gray-700',
    outline: 'bg-transparent text-emerald-600 border border-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-400 dark:hover:bg-emerald-900/20',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
    danger: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
        variants[variant],
        className
      )}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
};

const Card = ({ children, className, onClick }: any) => (
  <div 
    onClick={onClick}
    className={cn(
      'bg-white dark:bg-gray-900 rounded-2xl border border-emerald-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all',
      className
    )}
  >
    {children}
  </div>
);

const Input = ({ label, value, onChange, type = 'text', placeholder, icon: Icon, description }: any) => (
  <div className="space-y-2">
    {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all',
          Icon && 'pl-12'
        )}
      />
    </div>
    {description && <p className="text-xs text-gray-500">{description}</p>}
  </div>
);

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
    // Simulate initial load
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setLocation(loc);
          if (profile) setProfile({ ...profile, location: { ...loc, address: 'Current Location' } });
          toast.success('Location detected!');
        },
        () => {
          toast.error('Could not detect location. Using default.');
          const loc = { lat: 12.9716, lng: 77.5946 };
          setLocation(loc);
          if (profile) setProfile({ ...profile, location: { ...loc, address: 'Bangalore (Default)' } });
        }
      );
    }
  };

  const handleMockLogin = (role: 'farmer' | 'consumer') => {
    const mockUser = {
      uid: role === 'farmer' ? 'farmer1' : 'consumer1',
      displayName: role === 'farmer' ? 'Farmer Ramesh' : 'Sarah Johnson',
      email: role === 'farmer' ? 'ramesh@farm.com' : 'sarah@home.com',
    };
    setUser(mockUser);
    toast.success(`Logged in as ${mockUser.displayName}`);
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    setOnboardingStep(0);
    toast.success('Logged out successfully');
  };

  const saveProfile = (data: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...data, uid: user.uid, email: user.email } as UserProfile;
    setProfile(newProfile);
    toast.success('Profile updated!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sprout className="w-12 h-12 text-emerald-600 animate-bounce mx-auto" />
          <p className="text-emerald-800 dark:text-emerald-400 font-medium">Growing your experience...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-emerald-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-4">
            <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl rotate-3">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">SmartFarm Connect</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">AI-powered hyperlocal farm-to-consumer platform.</p>
          </div>

          <Card className="p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Prototype Login</h3>
              <div className="grid grid-cols-1 gap-3">
                <Button onClick={() => handleMockLogin('farmer')} variant="primary" className="w-full">
                  <Sprout className="w-5 h-5" /> Login as Farmer
                </Button>
                <Button onClick={() => handleMockLogin('consumer')} variant="secondary" className="w-full">
                  <ShoppingBasket className="w-5 h-5" /> Login as Consumer
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <div className="flex items-center gap-3 text-left text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Direct from local farms to your table</span>
              </div>
              <div className="flex items-center gap-3 text-left text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>AI-driven demand forecasting for zero waste</span>
              </div>
            </div>
          </Card>
          
          <p className="text-xs text-gray-400">Prototype Mode: No real credentials required.</p>
        </motion.div>
        <Toaster position="bottom-center" />
      </div>
    );
  }

  if (!profile || !profile.role) {
    return (
      <div className="min-h-screen bg-emerald-50 dark:bg-gray-950 p-6 flex items-center justify-center transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <AnimatePresence mode="wait">
            {onboardingStep === 0 && (
              <motion.div 
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {user.displayName}!</h2>
                  <p className="text-gray-600 dark:text-gray-400">How would you like to use SmartFarm Connect?</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card 
                    onClick={() => { saveProfile({ role: 'farmer' }); setOnboardingStep(1); }}
                    className="cursor-pointer group hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 p-8 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Sprout className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white">I am a Farmer</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">I want to produce based on demand and sell directly to consumers.</p>
                  </Card>

                  <Card 
                    onClick={() => { saveProfile({ role: 'consumer' }); setOnboardingStep(1); }}
                    className="cursor-pointer group hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 p-8 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <ShoppingBasket className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white">I am a Consumer</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">I want fresh, traceable produce delivered to my doorstep.</p>
                  </Card>
                </div>
              </motion.div>
            )}

            {onboardingStep === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <Card className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold dark:text-white">Complete your profile</h2>
                    <p className="text-gray-500 dark:text-gray-400">Help us connect you with your local cluster.</p>
                  </div>

                  <div className="space-y-4">
                    <Input 
                      label="Full Name" 
                      value={profile?.name || user.displayName || ''} 
                      onChange={(v: string) => setProfile(p => p ? { ...p, name: v } : null)}
                      placeholder="Enter your name"
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Location</label>
                      <Button 
                        variant="secondary" 
                        className="w-full justify-start"
                        onClick={detectLocation}
                      >
                        <MapPin className="w-5 h-5" />
                        {profile?.location ? `Location Captured: ${profile.location.lat.toFixed(2)}, ${profile.location.lng.toFixed(2)}` : 'Detect My Location'}
                      </Button>
                    </div>

                    {profile?.role === 'farmer' ? (
                      <div className="space-y-4">
                        <Input 
                          label="Land Size (Acres)" 
                          type="number"
                          value={profile?.landSize || ''} 
                          onChange={(v: string) => setProfile(p => p ? { ...p, landSize: Number(v) } : null)}
                          placeholder="e.g. 5"
                        />
                        <Input 
                          label="Land Type" 
                          value={profile?.landType || ''} 
                          onChange={(v: string) => setProfile(p => p ? { ...p, landType: v } : null)}
                          placeholder="e.g. Clay Loam"
                        />
                        <Input 
                          label="Pest Management" 
                          value={profile?.pestManagement || ''} 
                          onChange={(v: string) => setProfile(p => p ? { ...p, pestManagement: v } : null)}
                          placeholder="e.g. Integrated Pest Management (IPM)"
                        />
                      </div>
                    ) : (
                      <Input 
                        label="Household Size" 
                        type="number"
                        value={profile?.householdSize || ''} 
                        onChange={(v: string) => setProfile(p => p ? { ...p, householdSize: Number(v) } : null)}
                        placeholder="e.g. 4"
                      />
                    )}
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => saveProfile(profile || {})}
                    disabled={!profile?.location}
                  >
                    Finish Setup
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <Toaster position="bottom-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">SmartFarm</span>
          </div>
          
          <nav className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium">
              <MapPin className="w-4 h-4" />
              <span>Local Cluster (5km)</span>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="p-2">
              <LogOut className="w-5 h-5" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {profile.role === 'farmer' ? (
          <FarmerDashboard profile={profile} />
        ) : (
          <ConsumerDashboard profile={profile} />
        )}
      </main>

      <Toaster position="bottom-center" />
    </div>
  );
}

// --- Dashboard Components ---

const WeatherWidget = () => (
  <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Sun className="w-8 h-8" />
        <div>
          <p className="text-3xl font-bold">{WEATHER_DATA.temp}°C</p>
          <p className="text-emerald-100 text-sm">{WEATHER_DATA.condition}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm opacity-80">Humidity: {WEATHER_DATA.humidity}%</p>
        <p className="text-sm opacity-80">Wind: {WEATHER_DATA.wind} km/h</p>
      </div>
    </div>
    <div className="flex justify-between pt-4 border-t border-white/20">
      {WEATHER_DATA.forecast.map((f, i) => (
        <div key={i} className="text-center">
          <p className="text-[10px] uppercase opacity-70 mb-1">{f.day}</p>
          <f.icon className="w-4 h-4 mx-auto mb-1" />
          <p className="text-xs font-bold">{f.temp}°</p>
        </div>
      ))}
    </div>
  </Card>
);

const SubscriptionModal = ({ isOpen, onClose, role }: any) => {
  const plans = role === 'farmer' ? [
    { name: 'Basic', price: 'Free', features: ['AI Advisory', 'Market Access', 'Basic Analytics'], icon: Sprout },
    { name: 'Premium', price: '₹499/mo', features: ['Advanced Advisory', 'Satellite Monitoring', 'Priority Support', 'Pest Alerts'], icon: Sparkles, recommended: true },
    { name: 'Enterprise', price: 'Custom', features: ['Supply Chain Integration', 'Dedicated Manager', 'Custom Analytics'], icon: Globe },
  ] : [
    { name: 'Free', price: 'Free', features: ['Local Basket Access', 'Standard Delivery'], icon: ShoppingBasket },
    { name: 'Fresh Pass', price: '₹199/mo', features: ['Free Delivery', 'Exclusive Farm Access', 'Pre-order Priority'], icon: Sparkles, recommended: true },
    { name: 'Family Plan', price: '₹499/mo', features: ['Bulk Discounts', 'Family Health Tracking', 'Farm Visits'], icon: UserIcon },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full p-8 relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <LogOut className="w-6 h-6 rotate-45" />
        </button>
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold dark:text-white mb-2">Choose Your Plan</h2>
          <p className="text-gray-500">Unlock the full potential of SmartFarm Connect.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div key={i} className={cn(
              "p-6 rounded-2xl border-2 transition-all relative flex flex-col h-full",
              plan.recommended ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10" : "border-gray-100 dark:border-gray-800"
            )}>
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Recommended
                </div>
              )}
              <div className="mb-4">
                <plan.icon className="w-10 h-10 text-emerald-600 mb-2" />
                <h3 className="text-xl font-bold dark:text-white">{plan.name}</h3>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{plan.price}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.recommended ? 'primary' : 'secondary'} className="w-full">Select Plan</Button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const AIChatbot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your SmartFarm AI assistant. How can I help you today? You can ask about crop health, market prices, or delivery status.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg = { role: 'assistant', content: `Based on your query "${input}", I recommend checking the latest market trends in the Analytics tab. For specific crop advice, the AI Advisory section has been updated with soil moisture data for your cluster.` };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <Card className="h-[600px] flex flex-col p-0 overflow-hidden border-none shadow-xl">
      <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6" />
          <div>
            <h3 className="font-bold">SmartFarm AI</h3>
            <p className="text-[10px] opacity-80">Always active for your growth</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
        {messages.map((m, i) => (
          <div key={i} className={cn(
            "max-w-[80%] p-3 rounded-2xl text-sm",
            m.role === 'user' 
              ? "bg-emerald-600 text-white ml-auto rounded-tr-none" 
              : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 mr-auto rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-800"
          )}>
            <Markdown>{m.content}</Markdown>
          </div>
        ))}
        {isTyping && (
          <div className="bg-white dark:bg-gray-900 text-gray-400 p-3 rounded-2xl text-xs mr-auto shadow-sm border border-gray-100 dark:border-gray-800 flex gap-1">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce delay-100">.</span>
            <span className="animate-bounce delay-200">.</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything..."
          className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
        />
        <Button onClick={handleSend} className="p-2 rounded-xl">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  );
};

function FarmerDashboard({ profile }: { profile: UserProfile }) {
  const [advisories] = useState<Advisory[]>(SAMPLE_ADVISORIES);
  const [activeTab, setActiveTab] = useState<'advisory' | 'produce' | 'analytics' | 'map' | 'forecast'>('advisory');
  const [isLogHarvestOpen, setIsLogHarvestOpen] = useState(false);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [selectedCropOnMap, setSelectedCropOnMap] = useState<any | null>(null);

  const harvestData = {
    area: '5.2 Acres',
    landType: 'Fertile Black Soil',
    pestManagement: 'Organic Neem-based',
    cropCalendar: [
      { month: 'Jan', activity: 'Soil Prep' },
      { month: 'Feb', activity: 'Sowing' },
      { month: 'Mar', activity: 'Irrigation' },
      { month: 'Apr', activity: 'Pest Control' },
      { month: 'May', activity: 'Harvest' },
    ]
  };

  const farmCrops = [
    { id: 1, name: 'Organic Spinach', health: 92, status: 'Healthy', lat: 12.9716, lng: 77.5946, stage: 'Vegetative' },
    { id: 2, name: 'Cherry Tomatoes', health: 75, status: 'Ripening', lat: 12.9750, lng: 77.5980, stage: 'Fruiting' },
    { id: 3, name: 'Bell Peppers', health: 60, status: 'Pest Alert', lat: 12.9680, lng: 77.5920, stage: 'Flowering' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Farmer Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">Welcome back, {profile.name}. Here's your AI-powered production plan.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-sm flex-1 sm:flex-none" onClick={() => setIsSubscriptionOpen(true)}>
            <CreditCard className="w-4 h-4" /> Plans
          </Button>
          <Button variant="outline" className="text-sm flex-1 sm:flex-none" onClick={() => setIsHeatmapOpen(true)}>
            <Globe className="w-4 h-4" /> Market Heatmap
          </Button>
          <Button className="text-sm flex-1 sm:flex-none" onClick={() => setIsLogHarvestOpen(true)}>
            <Plus className="w-4 h-4" /> Log Harvest
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl w-fit overflow-x-auto max-w-full no-scrollbar">
        {[
          { id: 'advisory', label: 'AI Advisory', icon: Sprout },
          { id: 'produce', label: 'My Produce', icon: Package },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'map', label: 'Farm Map', icon: MapPin },
          { id: 'forecast', label: 'AI Forecast', icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'advisory' && (
          <motion.div 
            key="advisory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <WeatherWidget />
              <Card className="bg-emerald-600 text-white border-none shadow-emerald-200 dark:shadow-none">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Active Demand</span>
                    <TrendingUp className="w-5 h-5 opacity-50" />
                  </div>
                  <div className="text-4xl font-bold">2.4 Tons</div>
                  <p className="text-emerald-100 text-sm">Total demand in your 5km cluster</p>
                </div>
              </Card>

              <Card>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Expected Revenue</span>
                    <LayoutDashboard className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">₹92,400</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Based on current sowing plan</p>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                <Sprout className="w-6 h-6 text-emerald-600" />
                AI Sowing Advisory
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advisories.map((adv, i) => (
                  <Card key={i} className="relative overflow-hidden group flex flex-col h-full">
                    <div className="absolute top-0 right-0 p-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        i === 0 ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      )}>
                        {i === 0 ? 'High Demand' : 'Stable Demand'}
                      </span>
                    </div>
                    <div className="space-y-4 flex-1">
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{adv.crop}</h4>
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium">Target: {adv.recommendedQuantity}kg</p>
                      </div>
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                        <p className="text-sm text-emerald-800 dark:text-emerald-300 italic">"{adv.reasoning}"</p>
                      </div>
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Sun className="w-4 h-4" />
                          <span>Sowing: <span className="font-semibold text-gray-900 dark:text-white">{adv.sowingWindow}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <History className="w-4 h-4" />
                          <span>Harvest: <span className="font-semibold text-gray-900 dark:text-white">{adv.harvestTimeline}</span></span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-6">Accept Plan</Button>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'produce' && (
          <motion.div 
            key="produce"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="p-8 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold dark:text-white">No active produce listed</h3>
              <p className="text-gray-500">Log your first harvest to start selling directly to consumers.</p>
              <Button onClick={() => setIsLogHarvestOpen(true)}>Log New Harvest</Button>
            </Card>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div 
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-6 dark:text-white">Cluster Demand vs. Supply Trends</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ANALYTICS_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="demand" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="supply" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-6 mt-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Consumer Demand</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Local Supply</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-6 dark:text-white">Crop Yield Distribution</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Spinach', value: 400 },
                          { name: 'Tomatoes', value: 300 },
                          { name: 'Peppers', value: 300 },
                          { name: 'Carrots', value: 200 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#059669" />
                        <Cell fill="#10b981" />
                        <Cell fill="#34d399" />
                        <Cell fill="#6ee7b7" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-emerald-600" /> Spinach</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Tomatoes</div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'forecast' && (
          <motion.div 
            key="forecast"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <Card className="p-8 bg-emerald-900 text-white border-none">
              <div className="flex items-center gap-4 mb-6">
                <Sparkles className="w-10 h-10 text-emerald-400" />
                <div>
                  <h3 className="text-2xl font-bold">AI Demand Forecast</h3>
                  <p className="text-emerald-300">Predictive insights for the next 30 days</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-lg border-b border-emerald-800 pb-2">High Potential Crops</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between">
                      <span>Baby Corn</span>
                      <span className="text-emerald-400 font-bold">+45% Demand</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Purple Cabbage</span>
                      <span className="text-emerald-400 font-bold">+30% Demand</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Microgreens</span>
                      <span className="text-emerald-400 font-bold">+60% Demand</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-lg border-b border-emerald-800 pb-2">Market Sentiment</h4>
                  <p className="text-sm text-emerald-100 leading-relaxed">
                    Consumers in your cluster are shifting towards exotic greens. We predict a supply gap in the next 2 weeks. Sowing now will align perfectly with peak demand.
                  </p>
                  <Button variant="secondary" className="w-full">Generate Detailed Report</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'map' && (
          <motion.div 
            key="map"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-bold dark:text-white">Interactive Farm Map</h3>
              <p className="text-sm text-gray-500">Click on markers to see real-time crop health and status.</p>
            </div>
            <div className="relative h-[500px] rounded-3xl overflow-hidden border border-emerald-100 dark:border-gray-800 shadow-xl">
              <MapComponent lat={profile.location?.lat || 12.9716} lng={profile.location?.lng || 77.5946} zoom={15} />
              
              {/* Simulated Markers */}
              {farmCrops.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCropOnMap(crop)}
                  className="absolute p-2 bg-white dark:bg-gray-900 rounded-full shadow-lg border-2 border-emerald-500 hover:scale-110 transition-transform animate-bounce"
                  style={{ 
                    top: `${40 + (crop.id * 10)}%`, 
                    left: `${30 + (crop.id * 15)}%` 
                  }}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    crop.health > 80 ? "bg-emerald-500" : crop.health > 60 ? "bg-amber-500" : "bg-red-500"
                  )} />
                </button>
              ))}

              {/* Crop Detail Popup */}
              <AnimatePresence>
                {selectedCropOnMap && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl border border-emerald-100 dark:border-gray-800 z-20"
                  >
                    <button 
                      onClick={() => setSelectedCropOnMap(null)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                      <LogOut className="w-4 h-4 rotate-45" />
                    </button>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                          <Leaf className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-bold dark:text-white">{selectedCropOnMap.name}</h4>
                          <p className="text-xs text-gray-500">{selectedCropOnMap.stage} Stage</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Health</p>
                          <p className="font-bold text-emerald-600">{selectedCropOnMap.health}%</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">Status</p>
                          <p className="font-bold dark:text-white">{selectedCropOnMap.status}</p>
                        </div>
                      </div>
                      <Button variant="secondary" className="w-full text-xs py-2">View Full Analysis</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Harvest Modal */}
      <AnimatePresence>
        {isLogHarvestOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full p-8 relative overflow-y-auto max-h-[90vh]"
            >
              <button onClick={() => setIsLogHarvestOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <LogOut className="w-6 h-6 rotate-45" />
              </button>
              <h3 className="text-2xl font-bold mb-6 dark:text-white">Log New Harvest</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Crop Name" placeholder="e.g. Organic Spinach" />
                  <Input label="Quantity (kg)" type="number" placeholder="e.g. 50" />
                  <Input label="Harvest Date" type="date" />
                  <Input label="Quality Grade" placeholder="e.g. Grade A" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm dark:text-white">Farm Details</h4>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Area</p>
                        <p className="font-bold dark:text-white">{harvestData.area}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Land Type</p>
                        <p className="font-bold dark:text-white">{harvestData.landType}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Pest Management</p>
                        <p className="font-bold dark:text-white">{harvestData.pestManagement}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm dark:text-white">Crop Calendar</h4>
                    <div className="space-y-2">
                      {harvestData.cropCalendar.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm p-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-gray-500">{item.month}</span>
                          <span className="font-medium dark:text-white">{item.activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setIsLogHarvestOpen(false)}>Cancel</Button>
                <Button className="flex-1" onClick={() => { toast.success('Harvest logged successfully!'); setIsLogHarvestOpen(false); }}>
                  Confirm Harvest Log
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Heatmap Modal */}
      <AnimatePresence>
        {isHeatmapOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full p-8 relative"
            >
              <button onClick={() => setIsHeatmapOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <LogOut className="w-6 h-6 rotate-45" />
              </button>
              <h3 className="text-2xl font-bold mb-6 dark:text-white">Market Demand Heatmap</h3>
              <div className="h-96 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-center relative overflow-hidden border border-emerald-100 dark:border-gray-800">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-amber-500 to-red-500" />
                <div className="z-10 text-center space-y-4">
                  <Globe className="w-16 h-16 text-emerald-600 mx-auto animate-pulse" />
                  <p className="text-emerald-800 dark:text-emerald-300 font-bold">Live Demand Clusters Detected</p>
                  <div className="flex gap-4 justify-center">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> <span className="text-xs">High Demand</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /> <span className="text-xs">Medium</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> <span className="text-xs">Low</span></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                  <p className="text-2xl font-bold text-red-500">85%</p>
                  <p className="text-xs text-gray-500">Spinach Demand</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                  <p className="text-2xl font-bold text-amber-500">62%</p>
                  <p className="text-xs text-gray-500">Tomato Demand</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                  <p className="text-2xl font-bold text-emerald-500">40%</p>
                  <p className="text-xs text-gray-500">Carrot Demand</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SubscriptionModal 
        isOpen={isSubscriptionOpen} 
        onClose={() => setIsSubscriptionOpen(false)} 
        role="farmer" 
      />
    </div>
  );
}

function ConsumerDashboard({ profile }: { profile: UserProfile }) {
  const [basket, setBasket] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'shop' | 'basket' | 'orders' | 'map' | 'preorder' | 'history' | 'chatbot'>('shop');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return SAMPLE_ITEMS.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farm.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const addToBasket = (item: any) => {
    const existing = basket.find(b => b.id === item.id);
    if (existing) {
      setBasket(basket.map(b => b.id === item.id ? { ...b, quantity: (b.quantity || 1) + 1 } : b));
    } else {
      setBasket([...basket, { ...item, quantity: 1 }]);
    }
    toast.success(`Added ${item.name} to basket`);
  };

  const removeFromBasket = (id: number) => {
    setBasket(basket.filter(b => b.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setBasket(basket.map(b => {
      if (b.id === id) {
        const newQty = Math.max(1, (b.quantity || 1) + delta);
        return { ...b, quantity: newQty };
      }
      return b;
    }));
  };

  const total = basket.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Fresh Basket</h2>
          <p className="text-gray-500 dark:text-gray-400">Curated from farms within 5km of your home.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-sm flex-1 sm:flex-none" onClick={() => setIsSubscriptionOpen(true)}>
            <CreditCard className="w-4 h-4" /> Plans
          </Button>
          <Button className="text-sm flex-1 sm:flex-none" onClick={() => setActiveTab('basket')}>
            <ShoppingBasket className="w-4 h-4" /> {basket.length} Items
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl w-fit overflow-x-auto max-w-full no-scrollbar">
        {[
          { id: 'shop', label: 'Shop', icon: ShoppingBasket },
          { id: 'preorder', label: 'Pre-Order', icon: Calendar },
          { id: 'history', label: 'History & Savings', icon: History },
          { id: 'chatbot', label: 'AI Assistant', icon: Sparkles },
          { id: 'map', label: 'Local Farms', icon: MapPin },
          { id: 'basket', label: 'My Basket', icon: Package },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'shop' && (
          <motion.div 
            key="shop"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search for fresh crops or farms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map(item => (
                  <Card 
                    key={item.id} 
                    className="group cursor-pointer hover:border-emerald-500"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                        <ShoppingBasket className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.farm}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{item.price.toFixed(2)} / {item.unit}</span>
                          <Button 
                            variant="secondary" 
                            className="p-1.5 rounded-lg"
                            onClick={(e) => { e.stopPropagation(); addToBasket(item); }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="sticky top-24">
                <h3 className="text-xl font-bold mb-4 dark:text-white">Your Subscription</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Weekly Fresh Box</span>
                      <span className="text-[10px] font-bold bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded uppercase">Active</span>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Next delivery: Wednesday, April 1st</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Items in basket</span>
                      <span className="font-bold dark:text-white">{basket.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Estimated Total</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => setIsSubscriptionOpen(true)}>Manage Plans</Button>
                </div>
              </Card>

              <Card className="bg-emerald-900 dark:bg-emerald-950 text-white border-none">
                <div className="space-y-4">
                  <h4 className="font-bold">Impact Tracker</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-300">Farmer Income Boost</p>
                        <p className="text-sm font-bold">+25%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                        <Truck className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-300">Food Miles Saved</p>
                        <p className="text-sm font-bold">120 km</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'preorder' && (
          <motion.div 
            key="preorder"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto w-full space-y-8"
          >
            <Card className="p-8 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold dark:text-white">Post a Pre-Order Request</h3>
                  <p className="text-gray-500">Request specific crops in advance to get lower prices and guaranteed supply.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Crop Required" placeholder="e.g. Broccoli, Strawberries" />
                <Input label="Quantity" placeholder="e.g. 5kg" />
                <Input label="Max Price (₹)" type="number" placeholder="e.g. 100" />
                <Input label="Required By" type="date" />
              </div>
              <Button className="w-full py-4">Submit Pre-Order Request</Button>
            </Card>

            <div className="space-y-4">
              <h4 className="text-lg font-bold dark:text-white">Active Pre-Order Requests</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SAMPLE_PRE_ORDERS.map(pre => (
                  <Card key={pre.id} className="p-6 border-l-4 border-emerald-500">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h5 className="font-bold text-lg dark:text-white">{pre.crop}</h5>
                        <p className="text-sm text-gray-500">{pre.quantity} {pre.unit} @ max ₹{pre.maxPrice}/{pre.unit}</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Open</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Deadline: {pre.deadline}</span>
                      <span className="text-emerald-600 font-medium">3 Farmers Interested</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto w-full space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-2">Total Savings</p>
                <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">₹1,240</p>
                <p className="text-[10px] text-gray-500 mt-1">vs. Retail Market Prices</p>
              </Card>
              <Card className="text-center p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-2">Orders Placed</p>
                <p className="text-3xl font-black text-blue-700 dark:text-blue-300">12</p>
                <p className="text-[10px] text-gray-500 mt-1">In the last 3 months</p>
              </Card>
              <Card className="text-center p-6 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase mb-2">Farms Supported</p>
                <p className="text-3xl font-black text-amber-700 dark:text-amber-300">5</p>
                <p className="text-[10px] text-gray-500 mt-1">Local small-scale farmers</p>
              </Card>
            </div>

            <Card className="p-8">
              <h3 className="text-xl font-bold mb-6 dark:text-white">Order History</h3>
              <div className="space-y-4">
                {[
                  { id: 'ORD-123', date: 'Mar 15, 2026', items: 'Spinach, Tomatoes, Carrots', total: 450, status: 'Delivered' },
                  { id: 'ORD-124', date: 'Mar 08, 2026', items: 'Bell Peppers, Sweet Corn', total: 320, status: 'Delivered' },
                  { id: 'ORD-125', date: 'Mar 01, 2026', items: 'Red Onions, Tomatoes', total: 280, status: 'Delivered' },
                ].map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="space-y-1">
                      <p className="font-bold dark:text-white">{order.items}</p>
                      <p className="text-xs text-gray-500">{order.date} • {order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">₹{order.total}</p>
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded uppercase">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'chatbot' && (
          <motion.div 
            key="chatbot"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto w-full"
          >
            <AIChatbot />
          </motion.div>
        )}

        {activeTab === 'basket' && (
          <motion.div 
            key="basket"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto w-full"
          >
            <Card className="p-8 space-y-6">
              <h3 className="text-2xl font-bold dark:text-white">My Shopping Basket</h3>
              {basket.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <ShoppingBasket className="w-16 h-16 text-gray-200 mx-auto" />
                  <p className="text-gray-500">Your basket is empty. Start shopping from local farms!</p>
                  <Button variant="secondary" onClick={() => setActiveTab('shop')}>Go to Shop</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {basket.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                          <ShoppingBasket className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-bold dark:text-white">{item.name}</h4>
                          <p className="text-xs text-gray-500">₹{item.price} / {item.unit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold dark:text-white">{item.quantity || 1}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromBasket(item.id)}
                          className="text-red-500 hover:text-red-600 p-2"
                        >
                          <LogOut className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
                    <div className="flex justify-between text-xl font-bold dark:text-white">
                      <span>Total</span>
                      <span className="text-emerald-600 dark:text-emerald-400">₹{total.toFixed(2)}</span>
                    </div>
                    <Button className="w-full py-4 text-lg">Proceed to Checkout</Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === 'map' && (
          <motion.div 
            key="map"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-bold dark:text-white">Farms Near You</h3>
              <p className="text-sm text-gray-500">Discover 12 active farms within your 5km cluster. All produce is harvested fresh on order.</p>
            </div>
            <div className="relative h-[500px] rounded-3xl overflow-hidden border border-emerald-100 dark:border-gray-800 shadow-xl">
              <MapComponent lat={profile.location?.lat || 12.9716} lng={profile.location?.lng || 77.5946} zoom={14} />
              
              {/* Simulated Farm Markers */}
              {[
                { id: 1, name: 'Green Valley Farm', distance: '1.2 km', lat: 12.9716, lng: 77.5946 },
                { id: 2, name: 'Sunshine Acres', distance: '2.5 km', lat: 12.9750, lng: 77.5980 },
                { id: 3, name: 'Root & Soil', distance: '3.8 km', lat: 12.9680, lng: 77.5920 },
              ].map((farm) => (
                <div
                  key={farm.id}
                  className="absolute p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-emerald-100 dark:border-gray-800 flex items-center gap-3 group cursor-pointer hover:scale-105 transition-transform"
                  style={{ 
                    top: `${30 + (farm.id * 15)}%`, 
                    left: `${20 + (farm.id * 20)}%` 
                  }}
                >
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Sprout className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold dark:text-white">{farm.name}</p>
                    <p className="text-[10px] text-gray-500">{farm.distance} away</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SubscriptionModal 
        isOpen={isSubscriptionOpen} 
        onClose={() => setIsSubscriptionOpen(false)} 
        role="consumer" 
      />

      {/* Produce Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full p-8 relative overflow-y-auto max-h-[90vh]"
            >
              <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <LogOut className="w-6 h-6 rotate-45" />
              </button>
              
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 aspect-square bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
                  <ShoppingBasket className="w-16 h-16 text-emerald-600" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-3xl font-bold dark:text-white">{selectedItem.name}</h3>
                    <p className="text-emerald-600 font-medium">{selectedItem.farm}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black dark:text-white">₹{selectedItem.price}</span>
                    <span className="text-gray-500">/ {selectedItem.unit}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="font-bold dark:text-white">Popularity:</span>
                      <span className="text-gray-600 dark:text-gray-400">{selectedItem.popularity}</span>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Health Benefits</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">{selectedItem.healthBenefits}</p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Cooking Tips</p>
                      <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">{selectedItem.cookingTips}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Fun Fact</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">{selectedItem.funFact}</p>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => { addToBasket(selectedItem); setSelectedItem(null); }}>
                    Add to Basket
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

