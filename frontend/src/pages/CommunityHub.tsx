import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Phone, Search, MessageCircle, ThumbsUp, Send, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, MobileSidebarTrigger } from '@/components/AppSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Vendor {
    id: string;
    name: string;
    stallName: string;
    specialty: string;
    distance: number;
    phone: string;
    isVerified: boolean;
}

interface Comment {
    id: string;
    author: string;
    text: string;
    timestamp: Date;
}

interface Post {
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    likes: number;
    replies: number;
    type: 'update' | 'question' | 'help';
    comments?: Comment[];
}

interface Discussion {
    id: string;
    title: string;
    author: string;
    replies: number;
    category: 'license' | 'platform' | 'business' | 'general';
}

const CommunityHub = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('vendors');
    const [searchQuery, setSearchQuery] = useState('');
    const [newPostContent, setNewPostContent] = useState('');

    const [nearbyVendors, setNearbyVendors] = useState<Vendor[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [loading, setLoading] = useState(true);

    // Interaction State
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');

    // New Discussion State
    const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
    const [newDiscussionCategory, setNewDiscussionCategory] = useState<Discussion['category']>('general');

    // Fetch data from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vendorsRes, postsRes, discussRes] = await Promise.all([
                    fetch('http://localhost:5001/api/users'),
                    fetch('http://localhost:5001/api/community/posts'),
                    fetch('http://localhost:5001/api/community/discussions')
                ]);

                if (vendorsRes.ok) {
                    const vendorsData = await vendorsRes.json();
                    setNearbyVendors(vendorsData);
                }

                if (postsRes.ok) {
                    const postsData = await postsRes.json();
                    // Convert string timestamp back to Date object
                    const parsedPosts = postsData.map((p: any) => ({
                        ...p,
                        timestamp: new Date(p.timestamp),
                        comments: p.comments?.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) }))
                    }));
                    setPosts(parsedPosts);
                }

                if (discussRes.ok) {
                    const discussData = await discussRes.json();
                    setDiscussions(discussData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({ title: 'Error', description: 'Failed to load community data', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredVendors = nearbyVendors.filter(v =>
        v.stallName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCall = (vendor: Vendor) => {
        toast({
            title: '📞 Calling...',
            description: `Calling ${vendor.name}: ${vendor.phone}`
        });
    };

    const handleShare = (vendor: Vendor) => {
        toast({
            title: '📤 Sharing...',
            description: `Sharing ${vendor.stallName} details`
        });
    };

    const handleLike = async (postId: string) => {
        try {
            const res = await fetch(`http://localhost:5001/api/community/posts/${postId}/like`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
                toast({ title: '👍 Liked!', description: 'You liked this post' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCommentSubmit = async (postId: string) => {
        if (!commentText.trim()) return;

        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const authorName = user ? user.name : 'Guest User';

        try {
            const res = await fetch(`http://localhost:5001/api/community/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author: authorName, text: commentText })
            });

            if (res.ok) {
                const data = await res.json();
                const newComment = { ...data.comment, timestamp: new Date(data.comment.timestamp) };

                setPosts(prev => prev.map(p =>
                    p.id === postId
                        ? { ...p, replies: data.replies, comments: [...(p.comments || []), newComment] }
                        : p
                ));
                setCommentText('');
                toast({ title: 'Comment Added' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateDiscussion = async () => {
        if (!newDiscussionTitle.trim()) return;

        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const authorName = user ? user.name : 'Guest User';

        try {
            const res = await fetch('http://localhost:5001/api/community/discussions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newDiscussionTitle, category: newDiscussionCategory, author: authorName })
            });

            if (res.ok) {
                const data = await res.json();
                setDiscussions(prev => [...prev, data.discussion]);
                setNewDiscussionTitle('');
                toast({ title: 'Discussion Started' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmitPost = async () => {
        if (!newPostContent.trim()) {
            toast({ title: '⚠️ Empty Post', description: 'Please write something', variant: 'destructive' });
            return;
        }

        // Get current user from local storage or use guest
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const authorName = user ? user.name : 'Guest User';

        try {
            const response = await fetch('http://localhost:5001/api/community/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newPostContent,
                    author: authorName,
                    type: 'question' // Default type
                })
            });

            if (response.ok) {
                const data = await response.json();
                const newPost = { ...data.post, timestamp: new Date(data.post.timestamp) };
                setPosts(prev => [newPost, ...prev]);
                toast({ title: '✅ Posted!', description: 'Your post is now visible to the community' });
                setNewPostContent('');
            }
        } catch (error) {
            console.error('Error posting:', error);
            toast({ title: 'Error', description: 'Failed to post message', variant: 'destructive' });
        }
    };

    const handleJoinWhatsApp = () => {
        toast({ title: '📱 Opening WhatsApp', description: 'Joining the vendor community group' });
        window.open('https://chat.whatsapp.com/Eb80qIo1pAdHvHQiBUQd7j?mode=hqrt2', '_blank');
    };

    const getCategoryColor = (category: Discussion['category']) => {
        switch (category) {
            case 'license': return 'bg-blue-500';
            case 'platform': return 'bg-orange-500';
            case 'business': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background text-foreground">
                <AppSidebar />

                <main className="flex-1 overflow-y-auto">
                    <MobileSidebarTrigger />

                    {/* Header */}
                    <div className="sticky top-0 z-40 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-border backdrop-blur-sm">
                        <div className="container mx-auto px-4 py-4">
                            <div className="flex items-center gap-4 pt-10 md:pt-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate('/dashboard')}
                                    className="rounded-full hover:bg-muted"
                                >
                                    <ArrowLeft className="h-6 w-6" />
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                                        🤝 Community Hub
                                    </h1>
                                    <p className="text-sm text-primary/80 font-serif italic">
                                        "एकमेका सहाय्य करू, अवघे धरू सुपंथ" <br />
                                        <span className="text-xs text-muted-foreground not-italic font-sans">Connect with nearby vendors</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 py-6">
                        {/* Quick Intro */}
                        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 mb-6 shadow-md">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-2 bg-orange-100 rounded-full text-2xl">🌟</div>
                                <div>
                                    <p className="text-lg font-bold text-orange-900 font-serif">
                                        Community Hub (कम्युनिटी हब)
                                    </p>
                                    <p className="text-sm text-orange-700">
                                        Nearby vendors helping each other to grow • एकजुटीने प्रगतीकडे
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Main Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-4 bg-muted">
                                <TabsTrigger value="vendors" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    📍 Vendors
                                </TabsTrigger>
                                <TabsTrigger value="posts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    💬 Posts
                                </TabsTrigger>
                                <TabsTrigger value="discuss" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    🗣️ Discuss
                                </TabsTrigger>
                                <TabsTrigger value="whatsapp" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    📲 Group
                                </TabsTrigger>
                            </TabsList>

                            {/* NEARBY VENDORS TAB */}
                            <TabsContent value="vendors" className="space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by stall name or food type..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 h-14 text-lg rounded-xl bg-muted border-border"
                                    />
                                </div>

                                {/* Vendor List */}
                                <div className="space-y-3">
                                    {filteredVendors.map((vendor) => (
                                        <Card key={vendor.id} className="bg-card border-border shadow-lg hover:shadow-primary/10 transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-lg font-bold text-foreground">{vendor.stallName}</h3>
                                                            {vendor.isVerified && (
                                                                <Badge className="bg-accent text-accent-foreground text-xs">✓ Verified</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            🍽️ {vendor.specialty}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                {vendor.distance} km away
                                                            </span>
                                                            <span>👤 {vendor.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={() => handleCall(vendor)}
                                                            className="h-12 w-12 rounded-xl border-accent text-accent hover:bg-accent/10"
                                                        >
                                                            <Phone className="h-5 w-5" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={() => handleShare(vendor)}
                                                            className="h-12 w-12 rounded-xl border-primary text-primary hover:bg-primary/10"
                                                        >
                                                            <ExternalLink className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {filteredVendors.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground text-lg">No vendors found</p>
                                        <p className="text-sm text-muted-foreground">Try a different search term</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* COMMUNITY POSTS TAB */}
                            <TabsContent value="posts" className="space-y-4">
                                {/* New Post */}
                                <Card className="bg-card border-primary/30 shadow-lg">
                                    <CardContent className="p-4">
                                        <h3 className="text-lg font-semibold mb-3 text-foreground">📝 Share with Community</h3>
                                        <Textarea
                                            placeholder="Share a tip, ask a question, or help others..."
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            className="mb-3 bg-muted border-border min-h-[80px]"
                                        />
                                        <Button
                                            onClick={handleSubmitPost}
                                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            Post to Community
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Posts List */}
                                <div className="space-y-3">
                                    {posts.map((post) => (
                                        <Card key={post.id} className="bg-card border-border shadow-lg">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg">
                                                            👤
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-foreground">{post.author}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {post.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        className={
                                                            post.type === 'update' ? 'bg-blue-500' :
                                                                post.type === 'question' ? 'bg-orange-500' :
                                                                    'bg-green-500'
                                                        }
                                                    >
                                                        {post.type === 'update' ? '📢' : post.type === 'question' ? '❓' : '🆘'}
                                                    </Badge>
                                                </div>

                                                <p className="text-foreground mb-4">{post.content}</p>

                                                <div className="flex items-center gap-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleLike(post.id)}
                                                        className="text-muted-foreground hover:text-accent"
                                                    >
                                                        <ThumbsUp className="h-4 w-4 mr-1" />
                                                        {post.likes}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                                                        className={`text-muted-foreground hover:text-primary ${expandedPostId === post.id ? 'text-primary bg-primary/10' : ''}`}
                                                    >
                                                        <MessageCircle className="h-4 w-4 mr-1" />
                                                        {post.replies} replies
                                                    </Button>
                                                </div>

                                                {/* Comments Section */}
                                                {expandedPostId === post.id && (
                                                    <div className="mt-4 pt-4 border-t border-border animate-fade-in-up">
                                                        <div className="space-y-3 mb-4">
                                                            {post.comments?.map((comment) => (
                                                                <div key={comment.id} className="bg-muted/50 p-2 rounded-lg text-sm">
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <span className="font-bold">{comment.author}</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {comment.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                    <p>{comment.text}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                placeholder="Write a comment..."
                                                                value={commentText}
                                                                onChange={(e) => setCommentText(e.target.value)}
                                                                className="h-10"
                                                            />
                                                            <Button size="sm" onClick={() => handleCommentSubmit(post.id)}>Send</Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* DISCUSSIONS TAB */}
                            <TabsContent value="discuss" className="space-y-4">
                                <Card className="bg-card border-border shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-xl">🗣️ Popular Discussions</CardTitle>
                                        <CardDescription>Ask questions, get answers from vendors like you</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {discussions.map((discussion) => (
                                            <div
                                                key={discussion.id}
                                                className="flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge className={getCategoryColor(discussion.category)}>
                                                        {discussion.category === 'license' ? '📄' :
                                                            discussion.category === 'platform' ? '📱' :
                                                                discussion.category === 'business' ? '💼' : '💬'}
                                                    </Badge>
                                                    <div>
                                                        <p className="font-semibold text-foreground">{discussion.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            by {discussion.author} • {discussion.replies} replies
                                                        </p>
                                                    </div>
                                                </div>
                                                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <div className="flex gap-2 p-4 bg-muted rounded-xl">
                                        <Input
                                            placeholder="Topic Question?"
                                            value={newDiscussionTitle}
                                            onChange={(e) => setNewDiscussionTitle(e.target.value)}
                                            className="bg-background border-border"
                                        />
                                        <Button onClick={handleCreateDiscussion}>Start</Button>
                                    </div>

                                    <Button className="w-full text-lg hidden" variant="outline">
                                        ➕ Start New Discussion
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* WHATSAPP GROUP TAB */}
                            <TabsContent value="whatsapp" className="space-y-4">
                                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30 shadow-xl">
                                    <CardContent className="p-8 text-center">
                                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <span className="text-5xl">📲</span>
                                        </div>

                                        <h2 className="text-2xl font-bold text-foreground mb-2">
                                            Join Vendor WhatsApp Group
                                        </h2>
                                        <p className="text-muted-foreground mb-6">
                                            Get quick updates, share tips, and connect with 500+ vendors in your area!
                                        </p>

                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="bg-card rounded-xl p-4 border border-border">
                                                <p className="text-2xl font-bold text-primary">500+</p>
                                                <p className="text-sm text-muted-foreground">Vendors</p>
                                            </div>
                                            <div className="bg-card rounded-xl p-4 border border-border">
                                                <p className="text-2xl font-bold text-accent">Daily</p>
                                                <p className="text-sm text-muted-foreground">Updates</p>
                                            </div>
                                            <div className="bg-card rounded-xl p-4 border border-border">
                                                <p className="text-2xl font-bold text-secondary">Free</p>
                                                <p className="text-sm text-muted-foreground">To Join</p>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleJoinWhatsApp}
                                            className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all animate-pulse hover:animate-none"
                                        >
                                            <span className="text-2xl mr-3">📱</span>
                                            Join WhatsApp Group
                                        </Button>

                                        <p className="text-xs text-muted-foreground mt-4">
                                            You'll be added to our community group instantly
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Benefits */}
                                <Card className="bg-card border-border shadow-lg">
                                    <CardHeader>
                                        <CardTitle>✅ What You'll Get</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                                            <span className="text-2xl">📢</span>
                                            <p className="text-foreground">Daily price updates for vegetables & ingredients</p>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                                            <span className="text-2xl">🆘</span>
                                            <p className="text-foreground">Quick help from other vendors when you need it</p>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                                            <span className="text-2xl">💡</span>
                                            <p className="text-foreground">Business tips and festival sale ideas</p>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                                            <span className="text-2xl">🤝</span>
                                            <p className="text-foreground">Share and borrow ingredients from nearby vendors</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
};

export default CommunityHub;
