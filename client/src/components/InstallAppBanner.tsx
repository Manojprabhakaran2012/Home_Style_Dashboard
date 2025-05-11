import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallAppBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if the user has already dismissed the banner or installed the app
    const hasInteractedWithBanner = localStorage.getItem("appInstallBannerInteracted");
    
    // Only show the banner on mobile devices and if user hasn't interacted with it before
    if (!hasInteractedWithBanner && isMobile) {
      // Listen for the beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Store the event so it can be triggered later
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        // Show the banner
        setShowBanner(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, [isMobile]);

  const handleClose = () => {
    setShowBanner(false);
    // Mark that the user has interacted with the banner
    localStorage.setItem("appInstallBannerInteracted", "true");
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    
    // Clear the deferredPrompt variable, as it can't be used again
    setDeferredPrompt(null);
    
    // Hide the banner
    setShowBanner(false);
    
    // Mark that the user has interacted with the banner
    localStorage.setItem("appInstallBannerInteracted", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary text-white p-4 shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">Install HomeStyle Erode App</p>
            <p className="text-sm">Add to home screen for a better experience</p>
          </div>
        </div>
        <div className="flex items-center">
          <Button 
            variant="secondary" 
            size="sm" 
            className="mr-2 text-primary"
            onClick={handleInstall}
          >
            Install
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-primary/90"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}