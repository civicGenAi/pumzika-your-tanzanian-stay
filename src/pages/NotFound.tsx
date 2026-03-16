import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent rounded-full blur-[100px]" />
        </div>

        <div className="container max-w-3xl relative z-10 text-center space-y-12">
          {/* Visual Concept: An empty compass or map */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative h-48 w-48 rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center">
                <Map size={80} className="text-primary opacity-20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="font-display text-8xl font-black text-primary drop-shadow-2xl">404</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-display text-4xl md:text-5xl font-bold tracking-tight"
            >
              Looks like you're a bit lost.
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto"
            >
              The page you are looking for doesn't exist or has been moved to a new destination. Let's get you back on track.
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="px-8 py-6 text-lg rounded-full gap-2 shadow-xl shadow-primary/20" asChild>
              <Link to="/">
                <Home size={20} /> Back to explore
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg rounded-full gap-2" onClick={() => window.history.back()}>
              <ArrowLeft size={20} /> Go back
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm"
          >
            <Link to="/become-host" className="p-4 border border-border rounded-2xl hover:bg-muted/50 transition-colors">
              <h3 className="font-bold mb-1">Hosting on Pumzika</h3>
              <p className="text-muted-foreground">List your space and start earning</p>
            </Link>
            <Link to="/saved" className="p-4 border border-border rounded-2xl hover:bg-muted/50 transition-colors">
              <h3 className="font-bold mb-1">Your Saved Stays</h3>
              <p className="text-muted-foreground">Check out your wishlist</p>
            </Link>
            <Link to="/trips" className="p-4 border border-border rounded-2xl hover:bg-muted/50 transition-colors">
              <h3 className="font-bold mb-1">Manage Trips</h3>
              <p className="text-muted-foreground">View your upcoming adventures</p>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
