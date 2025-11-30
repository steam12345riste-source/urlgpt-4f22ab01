import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Redirect = () => {
  const { code } = useParams();

  useEffect(() => {
    const redirectToUrl = async () => {
      if (!code) return;

      try {
        const { data, error } = await supabase
          .from("shortened_urls")
          .select("id, original_url, expire_at")
          .eq("short_code", code)
          .maybeSingle();

        if (error || !data) {
          window.location.href = "/";
          return;
        }

        // Check if link has expired
        const expirationTime = new Date(data.expire_at).getTime();
        const now = new Date().getTime();
        
        if (now > expirationTime) {
          // Delete expired link
          await supabase
            .from("shortened_urls")
            .delete()
            .eq("id", data.id);
          
          window.location.href = "/";
          return;
        }

        window.location.href = data.original_url;
      } catch (error) {
        console.error("Redirect error:", error);
        window.location.href = "/";
      }
    };

    redirectToUrl();
  }, [code]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-pulse text-primary text-xl">Redirecting...</div>
      </div>
    </div>
  );
};

export default Redirect;
