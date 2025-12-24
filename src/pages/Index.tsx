import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, TrendingUp, DollarSign, BarChart3, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">PropVest</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dispositions">
              <Button variant="ghost">Dispositions</Button>
            </Link>
            <Button variant="outline" disabled>Properties</Button>
            <Button variant="outline" disabled>Deals</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <TrendingUp className="h-4 w-4" />
            Real Estate Investment Platform
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Disposition Underwriting
            <span className="text-primary"> Made Simple</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Analyze potential sales of single-family homes before listing. 
            Support for both single-property and portfolio dispositions with 
            comprehensive financial modeling.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dispositions">
              <Button size="lg" className="gap-2 px-8">
                View Dispositions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" disabled>
              Browse Properties
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
            <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Portfolio Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Analyze multiple properties together with portfolio-level metrics and 
              aggregated return calculations.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
            <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Detailed Underwriting</h3>
            <p className="text-sm text-muted-foreground">
              Configure sale price methodology, selling costs, and holding periods 
              with inline editing for quick adjustments.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
            <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Return Metrics</h3>
            <p className="text-sm text-muted-foreground">
              Calculate simple returns, annualized returns, and gain/loss vs basis 
              for each property and the portfolio.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>PropVest Disposition Underwriting Module</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
