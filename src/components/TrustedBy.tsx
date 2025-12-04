const companies = [
  "Google", "Microsoft", "Apple", "Amazon", "Meta",
  "Netflix", "Spotify", "Slack", "Dropbox", "Stripe",
  "Airbnb", "Uber", "Lyft", "Twitter", "LinkedIn",
  "Shopify", "Salesforce", "Adobe", "Oracle", "IBM",
  "Intel", "Cisco", "PayPal", "Square", "Zoom",
  "Figma", "Notion", "Canva", "Atlassian", "GitHub"
];

export const TrustedBy = () => {
  return (
    <div className="w-full py-12 overflow-hidden">
      <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-widest">
        Trusted by teams at
      </p>
      
      <div className="relative">
        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        {/* Scrolling container */}
        <div className="flex animate-scroll">
          {/* First set */}
          <div className="flex shrink-0 gap-12 px-6">
            {companies.map((company) => (
              <div
                key={company}
                className="flex items-center justify-center h-12 px-6 rounded-lg bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <span className="text-muted-foreground font-medium whitespace-nowrap text-sm">
                  {company}
                </span>
              </div>
            ))}
          </div>
          {/* Duplicate for seamless loop */}
          <div className="flex shrink-0 gap-12 px-6">
            {companies.map((company) => (
              <div
                key={`${company}-dup`}
                className="flex items-center justify-center h-12 px-6 rounded-lg bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <span className="text-muted-foreground font-medium whitespace-nowrap text-sm">
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};