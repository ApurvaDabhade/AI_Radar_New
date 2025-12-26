import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Star, TrendingUp, TrendingDown,
  ThumbsUp, ThumbsDown, Filter, Download, QrCode, Smartphone
} from 'lucide-react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QRCodeCanvas } from 'qrcode.react'

const Reviews = () => {
  const navigate = useNavigate()
  const [showQRCode, setShowQRCode] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [showMobileLink, setShowMobileLink] = useState(false)
  const [sentimentData, setSentimentData] = useState<{
    overall: {
      positive: number
      neutral: number
      negative: number
      total: number
      averageRating: number | null
    }
    trends: {
      positive: number
      neutral: number
      negative: number
    }
    categories: Array<{
      name: string
      positive: number
      neutral: number
      negative: number
      trend: number
    }>
    citywideData: Array<{
      category: string
      positive: number
      neutral: number
      negative: number
      total: number
    }>
  } | null>(null)

  const GOOGLE_FORM_BASE =
    'https://docs.google.com/forms/d/e/1FAIpQLSfUheDhxr_kB_I-OvXSmw2W6uFvmYo0DYC5cuxN2VS29Wf_Nw/viewform?usp=pp_url&entry.1018452666='

  const vendorId = 'vendor_01'
  const vendorFormUrl = `${GOOGLE_FORM_BASE}${encodeURIComponent(vendorId)}`

  // ---------------- API FETCH ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/gap_analysis?vendorId=${vendorId}`
        )
        setSentimentData(res.data.data)
      } catch (err) {
        console.error('⚠️ Failed to load gap analysis data:', err)
      }
    }
    fetchData()
  }, [vendorId])

  // ---------------- HELPERS ----------------
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-accent" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-destructive" />
    return <div className="h-4 w-4" />
  }

  const handleExport = () => {
    if (!sentimentData) return
    const csvData = [
      ['Category', 'Positive%', 'Neutral%', 'Negative%', 'Trend'],
      ...sentimentData.categories.map((c) => [
        c.name, c.positive, c.neutral, c.negative, c.trend
      ])
    ]
    const csvContent = csvData.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vendor_sentiment_data.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleMobileLink = () => {
    navigator.clipboard.writeText(vendorFormUrl)
    setShowMobileLink(true)
    setTimeout(() => setShowMobileLink(false), 2000)
  }

  if (!sentimentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p>Loading analysis data...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <MobileSidebarTrigger />

          {/* Header */}
          <div className="sticky top-0 z-40 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-border backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between pt-10 md:pt-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/dashboard')}
                  className="text-foreground hover:bg-primary/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="text-center">
                  <h1 className="text-xl font-bold text-primary">⭐ Customer Reviews</h1>
                  <p className="text-xs text-muted-foreground">Sentiment & Trend Analytics</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-primary/10"
                    onClick={() => setShowFilter((prev) => !prev)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-primary/10"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-card border-accent/30 shadow-lg">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Positive Reviews</p>
                    <p className="text-2xl font-bold text-accent">{sentimentData.overall.positive}%</p>
                    <div className="flex items-center mt-1">
                      {getTrendIcon(sentimentData.trends.positive)}
                      <span className="text-xs text-accent ml-1">
                        +{sentimentData.trends.positive}%
                      </span>
                    </div>
                  </div>
                  <ThumbsUp className="h-8 w-8 text-accent" />
                </CardContent>
              </Card>

              <Card className="bg-card border-secondary/30 shadow-lg">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Neutral Reviews</p>
                    <p className="text-2xl font-bold text-secondary">{sentimentData.overall.neutral}%</p>
                    <div className="flex items-center mt-1">
                      {getTrendIcon(sentimentData.trends.neutral)}
                      <span className="text-xs text-secondary ml-1">
                        {sentimentData.trends.neutral}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-destructive/30 shadow-lg">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Negative Reviews</p>
                    <p className="text-2xl font-bold text-destructive">{sentimentData.overall.negative}%</p>
                    <div className="flex items-center mt-1">
                      {getTrendIcon(sentimentData.trends.negative)}
                      <span className="text-xs text-destructive ml-1">
                        {sentimentData.trends.negative}%
                      </span>
                    </div>
                  </div>
                  <ThumbsDown className="h-8 w-8 text-destructive" />
                </CardContent>
              </Card>

              <Card className="bg-card border-primary/30 shadow-lg">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                    <p className="text-2xl font-bold text-primary">
                      {sentimentData.overall.averageRating ?? '-'} / 5
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-secondary fill-current" />
                      <span className="text-xs text-muted-foreground ml-1">
                        {sentimentData.overall.total} reviews
                      </span>
                    </div>
                  </div>
                  <Star className="h-8 w-8 text-secondary" />
                </CardContent>
              </Card>
            </div>

            {/* QR + Feedback Block */}
            <Card className="bg-card border-primary/30 mb-8 shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <QrCode className="h-8 w-8 text-primary mr-3" />
                      <h3 className="text-2xl font-bold">Quick Feedback</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Customers can scan this QR code to open the feedback form directly.
                    </p>
                    <div className="flex flex-wrap gap-3 items-center">
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => setShowQRCode((p) => !p)}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        {showQRCode ? 'Hide QR' : 'Create QR'}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-border text-foreground hover:bg-primary/10"
                        onClick={handleMobileLink}
                      >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                      {showMobileLink && (
                        <span className="text-xs text-muted-foreground">Link copied</span>
                      )}
                    </div>
                    {showQRCode && (
                      <div className="mt-4 flex flex-col items-center gap-3">
                        <div className="p-4 bg-white rounded-xl shadow border">
                          <QRCodeCanvas value={vendorFormUrl} size={180} level="H" includeMargin />
                        </div>
                        <div className="w-full max-w-xs text-center">
                          <p className="text-xs text-muted-foreground mb-1">Feedback link:</p>
                          <div className="text-xs bg-muted px-3 py-2 rounded border border-border break-all">
                            {vendorFormUrl}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="vendor" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger
                  value="vendor"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  🏪 Vendor Overview
                </TabsTrigger>
                <TabsTrigger
                  value="citywide"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  🌆 Citywide Comparison
                </TabsTrigger>
              </TabsList>

              {/* Vendor Specific Bars */}
              <TabsContent value="vendor" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sentimentData.categories.map((cat, i) => (
                    <Card key={i} className="bg-card border-border shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold">{cat.name}</h4>
                          {getTrendIcon(cat.trend)}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-accent">Positive</span>
                              <span>{cat.positive}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent rounded-full"
                                style={{ width: `${cat.positive}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-destructive">Negative</span>
                              <span>{cat.negative}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-destructive rounded-full"
                                style={{ width: `${cat.negative}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Citywide Comparison */}
              <TabsContent value="citywide" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sentimentData.citywideData.map((item, i) => (
                    <Card key={i} className="bg-card border-border shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-bold">{item.category}</h4>
                          <p className="text-xs text-muted-foreground">
                            {item.total} reviews
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-accent">Positive</span>
                            <span>{item.positive}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full"
                              style={{ width: `${item.positive}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-destructive">Negative</span>
                            <span>{item.negative}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-destructive rounded-full"
                              style={{ width: `${item.negative}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default Reviews