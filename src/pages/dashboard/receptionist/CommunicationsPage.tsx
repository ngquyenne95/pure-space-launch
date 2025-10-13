import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Calendar, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CommunicationsPage = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '';
  const { bookings } = useBookingStore();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const branchBookings = bookings.filter(b => b.branchId === branchId);
  const approvedBookings = branchBookings.filter(b => b.status === 'approved');

  const handleSendConfirmation = (bookingId: string) => {
    toast({
      title: 'Confirmation sent',
      description: 'Reservation confirmation email sent to customer.',
    });
  };

  const handleSendPaymentSuccess = (bookingId: string) => {
    toast({
      title: 'Payment confirmation sent',
      description: 'Payment success email sent to customer.',
    });
  };

  const handleSendCustomMessage = () => {
    if (!selectedBooking || !message) return;

    toast({
      title: 'Message sent',
      description: 'Custom message sent to customer.',
    });
    setMessage('');
    setSelectedBooking(null);
  };

  const templates = [
    {
      id: 'confirmation',
      title: 'Reservation Confirmation',
      content: 'Your reservation has been confirmed. We look forward to welcoming you!',
    },
    {
      id: 'reminder',
      title: 'Reservation Reminder',
      content: 'This is a reminder about your reservation tomorrow. Please let us know if you need to make any changes.',
    },
    {
      id: 'unavailable',
      title: 'Table Unavailable',
      content: 'Unfortunately, we do not have tables available for your requested time. Would you like to consider an alternative time?',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Customer Communications</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Reservations</h3>
          {approvedBookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{booking.guestName}</CardTitle>
                  <Badge>{booking.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.bookingDate} at {booking.bookingTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.numberOfGuests} guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.guestEmail}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleSendConfirmation(booking.id)}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Confirmation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedBooking(booking.id)}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {approvedBookings.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No recent reservations
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Message Templates</h3>
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="text-lg">{template.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{template.content}</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setMessage(template.content)}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}

          {selectedBooking && (
            <Card>
              <CardHeader>
                <CardTitle>Send Custom Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleSendCustomMessage}
                    disabled={!message}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedBooking(null);
                      setMessage('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationsPage;
