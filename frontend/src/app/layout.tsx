import "./globals.css";

export const metadata = {
  title: "URL Scraper",
  description: "Analyze any webpage: title, meta description, H1s, and link count",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <main className="w-full">{children}</main>
      </body>
    </html>
  );
}
