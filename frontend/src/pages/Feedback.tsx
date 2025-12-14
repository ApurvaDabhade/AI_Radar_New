import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Feedback = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast({
                title: "Rating required",
                description: "Please select a star rating",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            toast({
                title: "Thank you!",
                description: "Your feedback has been submitted successfully.",
            });
            // Reset form
            setRating(0);
            setName('');
            setPhone('');
            setComment('');
            // Optional: Navigate back or show success state
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-primary/20 shadow-xl">
                <CardHeader className="text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-4 top-4"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle className="text-2xl font-bold text-primary">Rate Your Experience</CardTitle>
                    <p className="text-sm text-muted-foreground">We value your feedback!</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center gap-2">
                            <label className="text-sm font-medium">How was the food?</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none transition-transform hover:scale-110"
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            className={`h-8 w-8 ${star <= (hoveredRating || rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground h-5">
                                {['', 'Terrible', 'Bad', 'Average', 'Good', 'Excellent'][hoveredRating || rating]}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Input
                                placeholder="Your Name (Optional)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Input
                                placeholder="Phone Number (Optional)"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <Textarea
                                placeholder="Tell us what you liked or how we can improve..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                'Submitting...'
                            ) : (
                                <>
                                    Submit Feedback <Send className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Feedback;
