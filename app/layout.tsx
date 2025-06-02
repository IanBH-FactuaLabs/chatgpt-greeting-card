export const metadata = {
  title: 'ChatGPT Greeting Card Designer',
  description: 'Conversational AI for creating greeting cards',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}