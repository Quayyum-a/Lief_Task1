import './globals.css'

export const metadata = {
  title: 'Healthcare Shift Tracker',
  description: 'Healthcare worker shift tracking application with location-based verification',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
