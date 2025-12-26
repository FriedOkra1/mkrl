import { Copy, Check, Link2, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import axios from 'axios';

interface ShortenedUrl {
  original: string;
  short: string;
  code: string;
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ShortenedUrl | null>(null);
  const [copied, setCopied] = useState(false);

  // Use relative path '/api' in production (Vercel rewrites handle this)
  // Use http://localhost:8000 in development
  const API_BASE_URL = import.meta.env.PROD 
    ? '/api' 
    : (import.meta.env.VITE_API_URL || 'http://localhost:8000/api');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Validate URL
  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Handle URL shortening
  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setCopied(false);

    // Validate and format URL
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (!isValidUrl(formattedUrl)) {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/shorten`, {
        long_url: formattedUrl,
      });
      
      const shortCode = response.data.short_code;
      // Construct the full short URL
      const baseUrl = API_BASE_URL.replace('/api', '');
      let fullShortUrl = `${baseUrl}/${shortCode}`;

      // If fullShortUrl starts with /, it's relative. Prepend origin for display/copy.
      if (fullShortUrl.startsWith('/')) {
         fullShortUrl = `${window.location.origin}${fullShortUrl}`;
      }

      const shortened = {
        original: formattedUrl,
        short: fullShortUrl,
        code: shortCode
      };
      
      setResult(shortened);
    } catch (err) {
      console.error(err);
      setError('Failed to shorten URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result.short);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        
        {/* Theme Toggle - Top Right */}
        <div className="flex justify-end mb-8">
          <button
            onClick={toggleTheme}
            className="p-2 border-2 border-foreground bg-background hover:bg-foreground hover:text-background transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Link2 className="w-12 h-12" />
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl tracking-tight mb-3">
            mkrl
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            TinyURL Clone
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-background border-4 border-foreground p-8">
          <div className="w-16 h-1 bg-blue-600 mb-8"></div>
          
          {/* Form */}
          <form onSubmit={handleShorten} className="space-y-6">
            <div>
              <label htmlFor="url-input" className="block mb-3 text-lg">
                Enter long URL
              </label>
              <input
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter long URL here..."
                className="w-full p-4 border-2 border-foreground bg-background text-foreground focus:outline-none focus:border-blue-600 transition-colors"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-4 border-2 border-foreground bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Shortening..." : "Shorten URL"}
            </button>
          </form>

          {/* Error State */}
          {error && (
            <div className="mt-6 p-4 border-2 border-red-600 bg-red-50 dark:bg-red-950 text-red-600">
              {error}
            </div>
          )}

          {/* Success/Result Section */}
          {result && (
            <div className="mt-8 pt-8 border-t-2 border-foreground">
              <p className="mb-4 text-muted-foreground">
                Your shortened URL:
              </p>
              <div className="border-2 border-foreground p-6 bg-background">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <a
                    href={result.short}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {result.short}
                  </a>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-foreground bg-background hover:bg-foreground hover:text-background transition-colors whitespace-nowrap"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Original URL: {result.original}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>The name mkrl stems from the amalgamation of two words: mk, an abbreviation of my name and URL</p>
        </div>

      </div>
    </div>
  );
}
