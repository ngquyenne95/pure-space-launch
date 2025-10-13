import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore, Booking } from '@/store/bookingStore';
import { useTableStore } from '@/store/tableStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Users, Phone, Mail, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ReservationFormDialog } from '@/components/receptionist/ReservationFormDialog';
import { TableAssignmentDialog } from '@/components/receptionist/TableAssignmentDialog';
import { CustomerContactDialog } from '@/components/receptionist/CustomerContactDialog';

const ReservationsPage = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '';
  const { bookings, approveBooking, confirmBooking, declineBooking } = useBookingStore();
  const { tables } = useTableStore();
  const [search, setSearch] = useState('');
  const [reservationFormOpen, setReservationFormOpen] = useState(false);
  const [tableAssignmentOpen, setTableAssignmentOpen] = useState(false);
  const [customerContactOpen, setCustomerContactOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const branchBookings = bookings.filter(b => b.branchId === branchId);
  const filteredBookings = branchBookings.filter(b =>
    b.guestName.toLowerCase().includes(search.toLowerCase()) ||
    b.guestEmail.toLowerCase().includes(search.toLowerCase())
  );

  const pendingBookings = filteredBookings.filter(b => b.status === 'pending');
  const approvedBookings = filteredBookings.filter(b => b.status === 'approved');
  const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed');

  const getAvailableTables = (date: string, time: string, guests: number) => {
    return tables.filter(t => 
      t.branchId === branchId && 
      t.capacity >= guests &&
      t.status === 'available'
    );
  };

  const handleApprove = (booking: Booking) => {
    const mockPaymentLink = `https://payment.example.com/${booking.id}`;
    approveBooking(booking.id, mockPaymentLink);
    toast({
      title: 'Booking approved',
      description: 'Payment link sent to customer. Now assign a table.',
    });
    // Open table assignment dialog
    setSelectedBooking(booking);
    setTableAssignmentOpen(true);
  };

  const handleAssignTable = (booking: Booking) => {
    setSelectedBooking(booking);
    setTableAssignmentOpen(true);
  };

  const handleDecline = (bookingId: string) => {
    declineBooking(bookingId);
    toast({
      title: 'Booking declined',
      description: 'Customer has been notified.',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      approved: 'default',
      confirmed: 'default',
      declined: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Reservation Management</h2>
        <Button onClick={() => setReservationFormOpen(true)}>
          <Calendar className="mr-2 h-4 w-4" />
          New Reservation
        </Button>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pending Reservations ({pendingBookings.length})</h3>
          {pendingBookings.map((booking) => {
            const availableTables = getAvailableTables(
              booking.bookingDate,
              booking.bookingTime,
              booking.numberOfGuests
            );
            
            return (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{booking.guestName}</CardTitle>
                    {getStatusBadge(booking.status)}
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
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.guestPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.guestEmail}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-semibold mb-2">
                      Available Tables: {availableTables.length}
                    </div>
                    {availableTables.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {availableTables.slice(0, 5).map(t => (
                          <Badge key={t.id} variant="outline">
                            Table {t.number} ({t.capacity})
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-destructive">No tables available</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleApprove(booking)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleDecline(booking.id)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {pendingBookings.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending reservations
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Approved ({approvedBookings.length})</h3>
          {approvedBookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{booking.guestName}</CardTitle>
                  {getStatusBadge(booking.status)}
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
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.guestPhone}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleAssignTable(booking)}
                >
                  Assign Table
                </Button>
              </CardContent>
            </Card>
          ))}
          {approvedBookings.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No approved reservations
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Confirmed ({confirmedBookings.length})</h3>
          {confirmedBookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{booking.guestName}</CardTitle>
                  {getStatusBadge(booking.status)}
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
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.guestPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.guestEmail}</span>
                  </div>
                </div>

                {booking.items && booking.items.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="text-sm font-semibold">Pre-ordered Items</div>
                    {booking.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {confirmedBookings.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No confirmed reservations
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ReservationFormDialog
        open={reservationFormOpen}
        onOpenChange={setReservationFormOpen}
        branchId={branchId}
        branchName="Current Branch"
      />

      {selectedBooking && (
        <>
          <TableAssignmentDialog
            open={tableAssignmentOpen}
            onOpenChange={setTableAssignmentOpen}
            bookingId={selectedBooking.id}
            branchId={branchId}
            numberOfGuests={selectedBooking.numberOfGuests}
            onNoTablesAvailable={() => {
              setCustomerContactOpen(true);
            }}
          />

          <CustomerContactDialog
            open={customerContactOpen}
            onOpenChange={setCustomerContactOpen}
            booking={selectedBooking}
            onCreateNewReservation={() => {
              setReservationFormOpen(true);
            }}
          />
        </>
      )}
    </div>
  );
};

export default ReservationsPage;
